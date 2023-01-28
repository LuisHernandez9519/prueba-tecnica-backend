
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from './../app'


const tarjeta = {
    card_number: "4111111111111111",
    cvv: "123",
    expiration_month: "8",
    expiration_year: "2023",
    email: "hernandezluis9519@gmail.com"
}

describe("validar que todas las peticiones tengan el token de comercio", () => {

    test('debe fallar si no se envia el codigo de comercio en el header',  async() => {
        
        const response = await request(app).get('/token/45855').send()
        
        expect(response.statusCode).toBe(400)
        
        expect(response.headers["content-type"]).toEqual(expect.stringContaining('json'))
        
        expect(response.body.success).toBe(false)
    })

    test('debe de fallar si se envia un codigo de comercio que no cumpla con el prefijo pk_test_', async() => {
        
        const response = await request(app).get('/token/45855').set({Authorization:'Bearer pkk_test_4587'}).send()
        
        expect(response.statusCode).toBe(401)

        expect(response.headers["content-type"]).toEqual(expect.stringContaining('json'))

        expect(response.body.success).toBe(false)

    })
    
})

describe("POST /token", () => {

    test('creacion de token', async () => {

        const response = await request(app).post('/token').set({Authorization: 'Bearer pk_test_4525877'}).send(tarjeta)

        const token = response.body.payload.token
        
        const decoded = jwt.decode(token, { complete: true })

        expect(response.statusCode).toBe(200)
        
        expect(decoded.header).toBeDefined()
        
        expect(decoded.payload).toBeDefined()

        expect(decoded.signature).toBeDefined()
    })
})

describe("GET /token/{token}", () => {

    test('validar que se envia un token invalido', async () => {
        
        const response = await request(app).get('/token/452365894').set({Authorization: 'Bearer pk_test_4525877'}).send()
        
        expect(response.statusCode).toBe(400)
        
        expect(response.body).toEqual({success: false, msgError: 'Token inválido'})
    })

    test('validar que el token valido enviado haya expirado', async() => {
        
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJkX251bWJlciI6IjQxMTExMTExMTExMTExMTEiLCJjdnYiOiIxMjMiLCJleHBpcmF0aW9uX21vbnRoIjoiOSIsImV4cGlyYXRpb25feWVhciI6IjIwMjMiLCJlbWFpbCI6ImZyYW5rOTVAZ21haWwuY29tIiwiaWF0IjoxNjc0ODAwODU1LCJleHAiOjE2NzQ4MDA5MTV9.28VY1CWCS38CCDNPcRiBFIWgdZHK8UJuaHWEyHG_LLo'
        
        const response = await request(app).get(`/token/${token}`).set({Authorization: 'Bearer pk_test_4525877'}).send()

        expect(response.statusCode).toBe(400)

        expect(response.body).toEqual({success: false, msgError: 'Token ha expirado'})

    })
})

