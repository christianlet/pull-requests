import { Application } from 'express'
import { MongoDb } from '../../clients/mongo-db'


export const find = (app: Application) => {
    app.get('/pull-requests/:id', async (req, res) => {
        const id = req.params.id

        try {
            const collection = MongoDb.getCollection('pull-requests')
            const item = await collection.findOne({ node_id: id })

            res.status(200).json({
                item: item ?? null
            })
        } catch (err) {
            console.log(err)

            res.status(500).json({ error: 'Failed to fetch item' })
        }
    })
}