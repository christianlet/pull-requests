import { PullRequest, PullRequestFull } from '../../../types/api-types'


export interface EditablePullRequest extends PullRequestFull {
    edits?: {
        target_branch?: string
    }
}