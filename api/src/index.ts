import cors from 'cors'
import express from 'express'
import { collectionsRouter } from './routes/collections'
import { githubRouter } from './routes/github'

const app = express()

app.use(express.json())
app.use(cors())
app.use('/github', githubRouter)
app.use('/collections', collectionsRouter)

export default app
