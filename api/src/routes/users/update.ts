import { RequestHandler } from 'express'
import { MongoDb } from '../../clients/mongo-db'
import { CollectionName } from '../../enums/collection-name'

export const update: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        const collection = MongoDb.getCollection(CollectionName.USERS)
        const result = await collection.updateOne(
            { id: parseInt(req.params.id) },
            { $set: req.body }
        )

        if (result.matchedCount === 0) {
            res.status(404).json({ error: 'Item not found' })

            return
        }

        res.status(200).json(result)
    } catch (err) {
        console.log(err)

        res.status(500).json({ error: 'Failed to update item' })
    }
}