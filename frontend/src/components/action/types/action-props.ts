import { AuthenticatedUser } from '../../../types/api-types'
import { EditablePullRequest } from './editable-pull-request'

export interface ActionProps {
    repos: null | false | EditablePullRequest[]
    selectedRepos: EditablePullRequest[]
    branch: string
    user: null | AuthenticatedUser
    setRefreshRepos: (refreshRepos: number) => void
    setSelectedRepos: (repos: EditablePullRequest[]) => void
}