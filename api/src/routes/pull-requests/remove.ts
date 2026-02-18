import { RequestHandler } from 'express-serve-static-core'
import { MongoDb } from '../../clients/mongo-db'
import { CollectionName } from '../../enums/collection-name'

export const remove: RequestHandler = async (req, res) => {
    try {
        const collection = MongoDb.getCollection(CollectionName.PULL_REQUESTS)
        const result = await collection.deleteOne(
            { node_id: req.params.id }
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