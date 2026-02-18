import { RequestHandler } from 'express'
import { MongoDb } from '../../clients/mongo-db'


export const find: RequestHandler = async (req, res) => {
    const id = req.params.id

    try {
        const collection = MongoDb.getCollection('teams')
        const item = await collection.findOne({ id })

        res.status(200).json({
            item: item ?? null
        })
    } catch (err) {
        console.log(err)

        res.status(500).json({ error: 'Failed to fetch item' })
    }
}