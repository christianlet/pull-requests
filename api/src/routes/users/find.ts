import { Application } from 'express'
import { MongoDb } from '../../clients/mongo-db'


export const find = (app: Application) => {
    app.get('/users/:id', async (req, res) => {
        const id = parseInt(req.params.id)

        try {
            const collection = MongoDb.getCollection('users')
            const item = await collection.findOne({ id })

            res.status(200).json({
                item: item ?? null
            })
        } catch (err) {
            console.log(err)

            res.status(500).json({ error: 'Failed to fetch item' })
        }
    })
}