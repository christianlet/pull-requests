import { Express } from 'express-serve-static-core'
import { MongoDb } from '../../clients/mongo-db'

export const create = (app: Express) => {
    app.post('/releases', async (req, res) => {
        try {
            const collection = MongoDb.getCollection('releases')
            const result = await collection.insertOne(req.body)
            res.status(201).json(result)
        } catch (err) {
            console.log(err)

            res.status(500).json({ error: 'Failed to create item' })
        }
    })
}