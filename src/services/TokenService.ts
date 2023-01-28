import jwt from 'jsonwebtoken'
import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'


AWS.config.update({region:'us-east-1'})

const docClient = new AWS.DynamoDB.DocumentClient();

interface CardI {
    card_number: number,
    cvv: number,
    expiration_month: string,
    expiration_year: string,
    email: string
}

interface TransaccionI extends CardI{
    token: string
}

class TokenService {

    static generarToken(datos: CardI): string {

        const token = jwt.sign(datos, process.env.JWT_SECRET,{expiresIn: 60})

        return token
    }

    static async registrarTransaccion(datos: TransaccionI) {

        try {
            const params = {
                TableName: process.env.TBL_TRANSACCION,
                Item: {
                    ID: uuidv4(),
                    ...datos
                }
            }

            const res = await docClient.put(params).promise() 
            
            return {success: true}
        } catch (error) {
            console.log({error})
            return {success: false, error}
        }

    }

    static async obtenerDatosToken (token: string) {
        try {
            const validateToken = await TokenService.validarToken(token)

            if (!validateToken.tokenValid) {
                return {success: false, error: validateToken.errorToken}
            }

            //obtener datos de dynamo a traves del token
            const params = {
                TableName: process.env.TBL_TRANSACCION,
                IndexName: 'token-index',
                KeyConditionExpression: '#token = :token ',
                ExpressionAttributeNames: {
                    '#token': 'token'
                },
                ExpressionAttributeValues: {
                ':token': token
                }
            }

            const result = await docClient.query(params).promise()

            const data = result.Items[0]

            const card = {
                expiration_year: data.expiration_year,
                expiration_month: data.expiration_month,
                card_number: data.card_number,
                email: data.email

            }

            console.log({result})

            return {success: true, data: card}        

        } catch (error) {
            return {success: false, error: 'Error al encontrar datos de la tarjeta'}
        }

    }

    static async validarToken(token: string): Promise<{tokenValid: boolean, errorToken?: string}> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            return {tokenValid: true}
        } catch (error) {
            switch(error.name) {
                case 'TokenExpiredError':
                    return {tokenValid: false, errorToken: 'Token ha expirado'}
                case 'JsonWebTokenError':
                    return {tokenValid: false, errorToken: 'Token inválido'}
            }
        }   
    }
}

export default TokenService