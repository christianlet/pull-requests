import { updatePullRequest } from './update-pull-request'

export const closePullRequest = async (owner: string, repo: string, pullNumber: number) => {
    const response = await updatePullRequest({
        owner,
        repo,
        pull_number: pullNumber,
        state: 'closed'
    })

    return response
}