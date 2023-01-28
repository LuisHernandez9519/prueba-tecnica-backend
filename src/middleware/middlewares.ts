import { Response, Request, NextFunction } from "express";


export const validarComercioMiddleware = (req: Request, res: Response, next: NextFunction) => {
    
    const headers = req.headers
    
    //validamos que el token venga en el header de la peticion
    if (!(headers?.authorization && headers?.authorization.split(" ")[1])) {
        return res.status(400).json({success: false, msgError: 'Codigo de comercio no ha sido asignado.'})
    }

    const tokenComercio = headers?.authorization.split(" ")[1]

    //validamos que el token recibido tenga el prefijo 'pk_test'
    const reg = /pk_test_(.*)/

    if (!reg.test(tokenComercio)) {
        return res.status(401).json({success: false, msgError: 'Codigo de comercio inválido.'})
    } 

    next()
}