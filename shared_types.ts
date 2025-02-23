import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type SimulationSettings = {
    chargePoints: number;
    consumptionPer100Km: number;
    chargePointWatts: number;
    arrivalMultiplier: number;
}

export type DatabaseClient = NodePgDatabase<Record<string, never>> & {
    $client: string;
};