import { GitHubApiClient } from '@christianlet/github-api-client';

export const getFiles = async (owner: string, repo: string, number: number) => {
    const factory = new GitHubApiClient()
    const octokit = await factory.generate()

    const { data } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: number
    })

    return data
}