
import { OctokitClient } from '../../octokit-client'

export const requestDevBranch = async (owner: string, repo: string, pullNumber: number) => {
    const octokit = await OctokitClient.getInstance()
    const devBranchManager = import.meta.env.REACT_APP_DEV_BRANCH_MANAGER

    if(!devBranchManager) {
        return false
    }

    const response = await octokit.pulls.requestReviewers({
        owner,
        repo,
        pull_number: pullNumber,
        reviewers: [
            devBranchManager
        ]
    })

    return response.status === 201
        ? response.data.requested_reviewers
        : false
}