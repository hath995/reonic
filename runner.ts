import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from "drizzle-orm";
import { simulationSettings } from './drizzle/schema';
import { run } from 'node:test';
import { Worker, isMainThread, parentPort, workerData, } from 'node:worker_threads';
const db = drizzle(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST!}/${process.env.POSTGRES_DB!}`);

if (parentPort) {
    parentPort.on('message', (message: {simulationId: number, start: Date, end: Date}) => {
        runSimulation(message.simulationId, message.start, message.end)
    });
}

async function runSimulation(simulationId: number, start: Date, end: Date) {
    //get simulation settings
    const simulationSetting = await db.select().from(simulationSettings).where(eq(simulationSettings.simulationId, simulationId));
}