import { Router, Response, Request } from "express"


import TokenController from "./controllers/TokenController"

const router = Router()

router.post('/token', TokenController.generarToken)

router.get('/token/:token', TokenController.obtenerToken)


export default router