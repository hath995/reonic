import 'dotenv/config'
import koa from 'koa'
import cors from 'kcors'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import http from 'http'
import { drizzle } from 'drizzle-orm/node-postgres';
import serverRouter from './src/routes'

const app = new koa()
const serverCallback = app.callback();
app.use(cors({origin: '*'}))
app.use(logger())
app.use(bodyParser())

const db = drizzle(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST!}/${process.env.POSTGRES_DB!}`);
app.use(serverRouter(db).routes())

let server = http.createServer(serverCallback)
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`)
});