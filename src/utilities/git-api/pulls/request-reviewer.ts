import { GitHubApiClient } from '@christianlet/github-api-client'

export const requestDevBranch = async (owner: string, repo: string, pullNumber: number) => {
    const factory = new GitHubApiClient()
    const octokit = await factory.generate()
    const devBranchManager = process.env.REACT_APP_DEV_BRANCH_MANAGER

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