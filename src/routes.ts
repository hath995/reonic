import router from 'koa-router';
import { DatabaseClient } from '../shared_types';
import { eq, and } from "drizzle-orm";
import { simulations, simulationSettings, demandProbabilities, arrivalProbabilities } from '../drizzle/schema';
import {
    simulationSchema,
    simulationSettingsSchema,
    simulationSettingsUpdateSchema,
    demandProbabilitySchema,
    demandProbabilitySchemaPartial,
    arrivalProbabilitySchema,
    simulationRequestSchema
} from './validation';
import {Worker} from 'node:worker_threads'; 
const Default_Simulation_ID = 0;

function serverRouter(db: DatabaseClient) {
    const apiRouter = new router();

    apiRouter.get('/', async (ctx) => {
        ctx.body = `Simulation services is running, ${new Date().toISOString()}`;
    });

    apiRouter.get('/simulations', async (ctx) => {
        const simulationsList = await db.select().from(simulations);
        ctx.body = simulationsList;
    });

    apiRouter.post('/simulations', async (ctx) => {
        const { name } = simulationSchema.parse(ctx.request.body);
        const simulation = await db.insert(simulations).values({name}).returning();
        //copy the settings and probabilities from the default simulation
        const defaultSimulationSettings = await db.select().from(simulationSettings).where(eq(simulationSettings.simulationId, Default_Simulation_ID));
        const defaultDemandProbabilities = await db.select().from(demandProbabilities).where(eq(demandProbabilities.simulationId, Default_Simulation_ID));
        const defaultArrivalProbabilities = await db.select().from(arrivalProbabilities).where(eq(arrivalProbabilities.simulationId, Default_Simulation_ID));
        await db.insert(simulationSettings).values({simulationId: simulation[0].id, settings: defaultSimulationSettings[0].settings});
        await db.insert(demandProbabilities).values(defaultDemandProbabilities.map((row) => ({simulationId: simulation[0].id, demand: row.demand, probability: row.probability})));
        await db.insert(arrivalProbabilities).values(defaultArrivalProbabilities.map((row) => ({simulationId: simulation[0].id, periodStart: row.periodStart, periodEnd: row.periodEnd, probability: row.probability})));

        ctx.body = simulation;
    });

    apiRouter.put('/simulations/:simulationId/settings', async (ctx) => {
        const simulationId= parseInt(ctx.params.simulationId);
        if(simulationId === Default_Simulation_ID) {
            ctx.throw(400, "Cannot update default simulation");
            return;
        }
        const { settings } = simulationSettingsSchema.parse(ctx.request.body);
        const simulationSetting = await db.update(simulationSettings).set({settings}).where(eq(simulationSettings.simulationId, simulationId)).returning();
        ctx.body = simulationSetting;
    });

    apiRouter.put('/simulations/:simulationId/settings/partial', async (ctx) => {
        const simulationId = parseInt(ctx.params.simulationId);
        if(simulationId === Default_Simulation_ID) {
            ctx.throw(400, "Cannot update default simulation");
            return;
        }
        const settingsPairs = simulationSettingsUpdateSchema.parse(ctx.request.body);
        let settings = await db.select().from(simulationSettings).where(eq(simulationSettings.simulationId, simulationId));
        if(settings.length === 0) {
            ctx.throw(400, "Simulation not found");
        }
        for(let pair of settingsPairs) {
            settings[0].settings![pair[0]] = pair[1];
        }
        const newSettings = await db.update(simulationSettings).set(settings[0]).where(eq(simulationSettings.simulationId, simulationId)).returning();
        ctx.body = newSettings;
    });

    //get demand probabilities
    apiRouter.get('/simulations/:simulationId/demand-probabilities', async (ctx) => {
        const simulationId = parseInt(ctx.params.simulationId);
        const demandProbabilitiesList = await db.select().from(demandProbabilities).where(eq(demandProbabilities.simulationId, simulationId));
        ctx.body = demandProbabilitiesList;
    });

    //update demand probabilities
    apiRouter.put('/simulations/:simulationId/demand-probabilities', async (ctx) => {
        const simulationId = parseInt(ctx.params.simulationId);
        if(simulationId === Default_Simulation_ID) {
            ctx.throw(400, "Cannot update default simulation");
            return;
        }
        const demandProbabilitiesList = demandProbabilitySchema.parse(ctx.request.body);
        let updated = [];
        for(let probability of demandProbabilitiesList) {
            let update = await db.update(demandProbabilities).set({probability: probability.probability}).where(and(eq(demandProbabilities.simulationId, simulationId), eq(demandProbabilities.id, probability.id))).returning();
            updated.push(update);
        }
        return updated;
    });

    apiRouter.post('/simulations/:simulationId/demand-probabilities', async (ctx) => {
        const simulationId = parseInt(ctx.params.simulationId);
        if(simulationId === Default_Simulation_ID) {
            ctx.throw(400, "Cannot update default simulation");
            return;
        }
        const demandProbabilitiesList = demandProbabilitySchemaPartial.parse(ctx.request.body);
        let inserted = [];
        for(let probability of demandProbabilitiesList) {
            let insert = await db.insert(demandProbabilities).values({simulationId, demand: probability.demand, probability: probability.probability}).returning();
            inserted.push(insert);
        }
        return inserted;
    });

    //get arrival probabilities
    apiRouter.get('/simulations/:simulationId/arrival-probabilities', async (ctx) => {
        const simulationId = parseInt(ctx.params.simulationId);
        const arrivalProbabilitiesList = await db.select().from(arrivalProbabilities).where(eq(arrivalProbabilities.simulationId, simulationId));
        ctx.body = arrivalProbabilitiesList;
    });

    //update arrival probabilities
    apiRouter.put('/simulations/:simulationId/arrival-probabilities', async (ctx) => {
        const simulationId = parseInt(ctx.params.simulationId);
        if(simulationId === Default_Simulation_ID) {
            ctx.throw(400, "Cannot update default simulation");
            return;
        }
        const arrivalProbabilitiesList = arrivalProbabilitySchema.parse(ctx.request.body);
        let updated = [];
        for(let probability of arrivalProbabilitiesList) {
            let update = await db.update(arrivalProbabilities).set({probability: probability.probability}).where(and(eq(arrivalProbabilities.simulationId, simulationId), eq(arrivalProbabilities.id, probability.id))).returning();
            updated.push(update);
        }
        return updated;
    });
    type SimulationMessages = {kind: "log", message: string} | {kind: "error", message: string} | {kind: "progress", progress: number} | {kind: "done", result: any};
    //simulate beween two time periods
    apiRouter.post('/simulations/:simulationId/simulate', async (ctx) => {
        const simulationId = parseInt(ctx.params.simulationId);
        const { start_timestamp, end_timestamp } = simulationRequestSchema.parse(ctx.request.body);
        let simulationResult = new Promise((resolve, reject) => {
            var worker = new Worker('./runner.js');
            worker.postMessage({simulationId, start: new Date(start_timestamp), end: new Date(end_timestamp)});
                worker.addListener("message", (message: SimulationMessages) => {
                    switch(message.kind) {
                        case "done":
                            resolve(message.result);
                            break;
                        case "error":
                            reject(message.message);
                            break;
                        case "log":
                            console.log('worker thread log:', message.message);
                            break;
                        case "progress":
                            console.log('worker thread progress:', message.progress);
                            break;
                    }
                });
        });
        ctx.body = simulationResult;

    });
    //get simulation results


    return apiRouter;
}

export default serverRouter;