import { GitHubApiClient } from '@christianlet/github-api-client'

export const updatePullRequest = async (owner: string, repo: string, pullNumber: number, params: Object) => {
    const factory = new GitHubApiClient()
    const octokit = await factory.generate()

    const response = await octokit.pulls.update({
        owner,
        repo,
        pull_number: pullNumber,
        ...params,
        maintainer_can_modify: false
    })

    return response.status === 200
}