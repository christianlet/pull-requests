import cors from 'cors'
import express from 'express'
import { githubRouter } from './routes/github'
import { pullRequestRouter } from './routes/pull-requests'
import { releasesRouter } from './routes/releases'
import { teamsRouter } from './routes/teams'
import { usersRouter } from './routes/users'

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Crud routes
app.use('/pull-requests', pullRequestRouter)
app.use('/users', usersRouter)
app.use('/releases', releasesRouter)
app.use('/teams', teamsRouter)
app.use('/github', githubRouter)

export default app
