import express from 'express'
import { validarComercioMiddleware } from './middleware/middlewares'
import router  from './routes'
require('dotenv').config()


const app = express();

app.use(express.json())

app.use(validarComercioMiddleware)

app.use(router)


export default app