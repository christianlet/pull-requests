import { RequestHandler } from 'express-serve-static-core'
import { MongoDb } from '../../clients/mongo-db'
import { CollectionName } from '../../enums/collection-name'

export const create: RequestHandler = async (req, res) => {
    try {
        const collection = MongoDb.getCollection(CollectionName.PULL_REQUESTS)

        const exists = await collection.findOne({ node_id: req.body.node_id })

        if (exists) {
            throw new Error('Item exists')
        }

        const result = await collection.insertOne(req.body)

        res.status(201).json(result)
    } catch (err) {
        console.log(err)

        res.status(500).json({ error: (err as Error).message })
    }
}