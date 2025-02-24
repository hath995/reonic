import { DatabaseClient, SimulationSettings } from "../shared_types";
import { eq, and, gt, max, InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
    simulationSettings,
    simulations,
    demandProbabilities,
    arrivalProbabilities,
    cars,
    chargePorts,
    chargingPortRecords,
    simulationResumption
} from "../drizzle/schema";
import Prando from "prando";

class Car {
    id?: number;
    constructor(public demand: number, id?: number) {
        this.id = id;
    }
}
class ChargePort {
    id?: number;
    localId: number;
    car: Car | null = null;
    constructor(
        cp: InferSelectModel<typeof chargePorts>,
        public status: "used" | "unused" = "unused"
    ) {
        this.id = cp.id;
        this.localId = cp.localId;
    }

    connect(car: Car) {
        this.car = car;
        this.status = "used";
    }

    disconnect() {
        this.status = "unused";
        this.car = null;
    }
}

class Demand {
    probabilities: number[];
    demands: number[];
    constructor(data: InferSelectModel<typeof demandProbabilities>[]) {
        data.sort((a, b) => b.demand - a.demand);
        this.probabilities = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].demand === 0) {
                this.probabilities.push(1.0);
            } else {
                this.probabilities.push(data[i].probability + (this.probabilities[i - 1] ?? 0));
            }
        }
        this.demands = data.map((row) => row.demand);
    }

    findDemand(probability: number): number {
        let index = this.probabilities.findIndex((row) => row >= probability);
        return this.demands[index];
    }
}

const MINUTE_INCREMENT = 15;
const HOUR = 60;

export async function runSimulation(mp: MessagePort, db: DatabaseClient, simulationId: number, start: Date, end: Date) {
    const simulation = await getSimulation(db, simulationId);
    const settings = await getSettings(db, simulationId);
    mp.postMessage({
        kind: "log",
        message: `Simulation ${simulation.name} started`
    });

    const demandDistribution = await setupDemandDistribution(db, simulationId);
    mp.postMessage({
        kind: "log",
        message: `Demand distribution: ${demandDistribution.demands.join(", ")} ${demandDistribution.probabilities.join(", ")}`
    });
    const arrivalProbabilitiesList = await db
        .select()
        .from(arrivalProbabilities)
        .where(eq(arrivalProbabilities.simulationId, simulationId));
    const arrivalProbabilityMap = new Map(arrivalProbabilitiesList.map((row) => [parseInt(row.periodStart.split(":")[0]), row.probability]));
    mp.postMessage({
        kind: "log",
        message: `Arrival probabilities: [${Array.from(arrivalProbabilityMap.entries()).map(x => JSON.stringify(x)).join(", ")}]`
    });
    let chargePoints = await setupChargePorts(db, simulationId, settings, start);

    let resumptionSeed = await db
        .select()
        .from(simulationResumption)
        .where(and(eq(simulationResumption.simulationId, simulationId), eq(simulationResumption.ts, start)));
    const seed = resumptionSeed.length > 0 ? resumptionSeed[0].seed : simulation.seed;
    let maxCarId = await db.select({maxId: max(cars.localId)}).from(cars).where(eq(cars.simulationId, simulationId));
    let nextCarId = maxCarId.length > 0 ? maxCarId[0].maxId! + 1 : 1;

    let currDate = new Date(start);
    const prando = new Prando(seed);
    let carRecords: InferInsertModel<typeof cars>[] = [];
    let chargingPortRecordsData: InferInsertModel<typeof chargingPortRecords>[] = [];
    while (currDate < end) {
        const arrivalProbability = arrivalProbabilityMap.get(currDate.getHours());

        if(arrivalProbability === undefined) {
            mp.postMessage({
                kind: "error",
                message: `No arrival probability found for ${currDate.toISOString()}`
            });
            return;
        }
        for (const chargePoint of chargePoints) {
            if (chargePoint.status === "used") {
                chargePoint.car!.demand -= settings.chargePointWatts * (MINUTE_INCREMENT / HOUR);
                chargingPortRecordsData.push({
                    simulationId,
                    chargePortID: chargePoint.id!,
                    carID: chargePoint.car!.id!,
                    ts: new Date(currDate),
                    demandKw: chargePoint.car?.demand! > 0 ? chargePoint.car?.demand! : 0
                });
                if (chargePoint.car!.demand <= 0) {
                    chargePoint.disconnect();
                }
            } else {
                let hasArrived = prando.next();
                if (hasArrived < arrivalProbability) {
                    let demandChance = prando.next();
                    let demandDistance = demandDistribution.findDemand(demandChance);
                    if (demandDistance > 0) {
                        let arrCar = new Car((demandDistance / 100) * settings.consumptionPer100Km);
                        arrCar.id = nextCarId++;
                        carRecords.push({ demand: arrCar.demand, simulationId, localId: arrCar.id });
                        chargePoint.connect(arrCar);
                        chargingPortRecordsData.push({
                            simulationId,
                            chargePortID: chargePoint.id!,
                            carID: arrCar.id!,
                            ts: new Date(currDate),
                            demandKw: arrCar.demand
                        });
                    }
                }
            }
        }
        mp.postMessage({
            kind: "log",
            message: `${currDate.toISOString()}`
        });
        currDate.setMinutes(currDate.getMinutes() + MINUTE_INCREMENT);
    }
    const chunk_size=1000;
    if(carRecords.length > 0) {
        let chunks = Array.from({ length: Math.ceil(carRecords.length / chunk_size) }, (_, i) => carRecords.slice(i * chunk_size, (i + 1) * chunk_size));
        mp.postMessage({
            kind: "log",
            message: `Inserting ${carRecords.length} car records in ${chunk_size} chunks`
        });
        let i = 0;
        for (const chunk of chunks) {
            mp.postMessage({
                kind: "log",
                message: `Inserting chunk ${i++} of ${chunks.length}`
            });
            await db.insert(cars).values(chunk);
        }
    }
    if(chargingPortRecordsData.length > 0 ) {
        let chunks = Array.from({ length: Math.ceil(chargingPortRecordsData.length / chunk_size) }, (_, i) => chargingPortRecordsData.slice(i * chunk_size, (i + 1) * chunk_size));
        mp.postMessage({
            kind: "log",
            message: `Inserting ${chargingPortRecordsData.length} charge records in ${chunk_size} chunks`
        });
        let i = 0;
        for (const chunk of chunks) {
            mp.postMessage({
                kind: "log",
                message: `Inserting chunk ${i++} of ${chunks.length}`
            });
            await db.insert(chargingPortRecords).values(chunk);
        }
    }
    // @ts-expect-error saving the updated seed for later, technically private, but we need it
    const nseed: number = prando._value;
    await db.insert(simulationResumption).values({ simulationId, ts: currDate, seed: nseed }).returning();
    mp.postMessage({
        kind: "done",
        result: `Simulation complete for ${simulation.name}-${simulationId} from ${start.toISOString()} to ${end.toISOString()}`
    });
}

async function setupDemandDistribution(db: DatabaseClient, simulationId: number) {
    const demandProbabilitiesList = await db
        .select()
        .from(demandProbabilities)
        .where(eq(demandProbabilities.simulationId, simulationId));
    return new Demand(demandProbabilitiesList);
}

async function getSettings(db: DatabaseClient, simulationId: number) {
    const settings = await db
        .select()
        .from(simulationSettings)
        .where(eq(simulationSettings.simulationId, simulationId));
    if (settings.length == 0 || settings[0].settings == null) {
        throw new Error("Simulation settings not found");
    }
    return settings[0].settings;
}

async function getSimulation(db: DatabaseClient, simulationId: number) {
    let sims = await db.select().from(simulations).where(eq(simulations.id, simulationId));
    if (sims.length == 0) {
        throw new Error("Simulation not found");
    }
    return sims[0];
}

async function setupChargePorts(
    db: DatabaseClient,
    simulationId: number,
    settings: SimulationSettings,
    start: Date,
): Promise<ChargePort[]> {
    let last15 = new Date(start);
    last15.setMinutes(last15.getMinutes() - 15);
    let cp = await db.select().from(chargePorts).where(eq(chargePorts.simulationId, simulationId));
    let chargingCars = await db
        .select()
        .from(chargingPortRecords)
        .where(
            and(
                eq(chargingPortRecords.simulationId, simulationId),
                eq(chargingPortRecords.ts, last15),
                gt(chargingPortRecords.demandKw, 0)
            )
        );
    let carMap = new Map(chargingCars.map((row) => [row.chargePortID, new Car(row.demandKw, row.carID)]));
    if (cp.length == settings.chargePoints) {
        const chargePoints = cp.map((row) => new ChargePort(row));
        for (const chargePoint of chargePoints) {
            if (carMap.has(chargePoint.id!)) {
                chargePoint.connect(carMap.get(chargePoint.id!)!);
            }
        }
        return chargePoints;
    } else if (cp.length > settings.chargePoints) {
        const chargePoints = cp.map((row) => new ChargePort(row));
        chargePoints.sort((a, b) => a.localId - b.localId);
        for (const chargePoint of chargePoints) {
            if (carMap.has(chargePoint.id!)) {
                chargePoint.connect(carMap.get(chargePoint.id!)!);
            }
        }
        return chargePoints.slice(0, settings.chargePoints);
    } else {
        let chargePoints = cp.map((row) => new ChargePort(row));
        for (const chargePoint of chargePoints) {
            if (carMap.has(chargePoint.id!)) {
                chargePoint.connect(carMap.get(chargePoint.id!)!);
            }
        }
        let newChargePoints = new Array(settings.chargePoints - cp.length)
            .fill(0)
            .map((_, i) => new ChargePort({ localId: cp.length + i, simulationId, id: -1 }));
        let cps = await db
            .insert(chargePorts)
            .values(newChargePoints.map((row) => ({ localId: row.localId, simulationId })))
            .returning();
        newChargePoints.forEach((row, i) => (row.id = cps[i].id));
        return chargePoints.concat(newChargePoints);
    }
}
