import { store } from '../../../store'
import { Factory } from '../../authorizations/factory'

export const requestDevBranch = async (owner: string, repo: string, pullNumber: number) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    const response = await octokit.pulls.requestReviewers({
        owner,
        repo,
        pull_number: pullNumber,
        reviewers: [
            'ashleymendez'
        ]
    })

    return response.status === 201
        ? response.data.requested_reviewers
        : false
}