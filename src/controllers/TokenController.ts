import { Express, Request, Response } from "express"
import Joi from 'joi'

import TokenService from "../services/TokenService"

class TokenController {

    static async generarToken (req: Request, res: Response) {

        const schemaCard = Joi.object({
            card_number: Joi.string().min(13).max(16).creditCard().required(),
            cvv: Joi.string().min(3).max(4).pattern(new RegExp('^[0-9]+$')).required(),
            expiration_month: Joi.string().pattern(new RegExp('^(1[0-2]|[1-9])$'), 'value between 1-12').required(),
            expiration_year: Joi.number().min(new Date().getFullYear()).max(new Date().getFullYear() + 5).required(),
            email: Joi.string().min(5).max(100).pattern(new RegExp('^[^@]+@(gmail\.com|hotmail\.com|yahoo\.es)$'), 'email type (gmail.com, hotmail.com, yahoo.es)').required()
        })

        const {card_number, cvv, expiration_month, expiration_year, email} = req.body

        const data = {
            card_number,
            cvv,
            expiration_month,
            expiration_year,
            email
        }

        const resultValidate = schemaCard.validate(data)

        if (resultValidate.error) {
            return res.status(400).json({success: false, msgError: resultValidate.error.details[0].message})
        }

        //generamos el token
        const token = TokenService.generarToken(data)

        //registramos la transaccion
        const result = await TokenService.registrarTransaccion({...data, token})

        if (!result.success) {
            return res.status(500).json({success: false, msgError: 'Hubo un error al clear token, por favor vuelva a intentarlo.'})
        }

        res.status(200).json({success: true, payload: {token}})

    }

    static async obtenerToken(req: Request, res: Response) {
        
        const { token } = req.params

        if (!token) {
            return res.status(400).json({success: false, msgError: 'Token no ha sido asignado.'})
        }

        const result = await TokenService.obtenerDatosToken(token)

        if (!result.success) {
            return res.status(400).json({success: false, msgError: result.error})
        }

        res.status(200).json({success: true, payload: result.data})
    }

}

export default TokenController