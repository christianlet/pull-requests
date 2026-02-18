import cors from 'cors'
import express from 'express'
import { pullRequestRouter } from './routes/pull-requests'
import releases from './routes/releases'
import teams from './routes/teams'
import users from './routes/users'

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Crud routes
app.use('/pull-requests', pullRequestRouter)

users(app)
releases(app)
teams(app)

export default app
