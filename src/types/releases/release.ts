import { RestEndpointMethodTypes } from '@octokit/rest'
import { PullRequestFull } from '../api-types'


export interface Release {
    createdAt: string
    fixVersion: string
    fixVersionLink: string
    team: string
    tickets: string[]
    steps: {
        qa: ReleaseStep
        regression: ReleaseStep
        production: ReleaseStep
    }
    branches: PullRequestFull[]
}

export interface ReleaseStep {
    label: string
    scheduledAt: string
    status: 'not-started' | 'in-progress' | 'completed' | 'skipped' | 'failed'
}
