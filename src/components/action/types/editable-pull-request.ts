import { PullRequest } from '../../../types/api-types'


export type EditablePullRequest = PullRequest & {
    edits?: {
        target_branch?: string
    }
}