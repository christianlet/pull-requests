import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth';

export const requestDevBranch = async (owner: string, repo: string, pullNumber: number) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

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