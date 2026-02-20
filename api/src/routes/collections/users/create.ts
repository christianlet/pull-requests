import { RequestHandler } from 'express'
import { MongoDb } from '../../../clients/mongo-db'
import { CollectionName } from '../../../enums/collection-name'

export const create: RequestHandler = async (req, res) => {
    try {
        const collection = MongoDb.getCollection(CollectionName.USERS)
        const result = await collection.insertOne(req.body)
        res.status(201).json(result)
    } catch (err) {
        console.log(err)

        res.status(500).json({ error: 'Failed to create item' })
    }
}