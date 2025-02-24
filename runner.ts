import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres';
import { parentPort, workerData, } from 'node:worker_threads';
import { runSimulation } from './src/simulation';

const db = drizzle(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST!}/${process.env.POSTGRES_DB!}`);

if (parentPort) {
    parentPort.on('message', (message: {simulationId: number, start: Date, end: Date}) => {
        runSimulation(parentPort!, db, message.simulationId, message.start, message.end)
    });
}
