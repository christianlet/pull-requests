import { RequestHandler } from 'express'
import { MongoDb } from '../../clients/mongo-db'

export const remove: RequestHandler = async (req, res) => {
    try {
        const collection = MongoDb.getCollection('releases')
        const result = await collection.deleteOne(
            { id: req.params.id }
        )

        if (!result.deletedCount) {
            res.status(404).json({ error: 'Item not found' })

            return
        }

        res.status(200).json(result)
    } catch (err) {
        console.log(err)

        res.status(500).json({ error: 'Failed to update item' })
    }
}