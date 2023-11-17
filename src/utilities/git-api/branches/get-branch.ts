import { GitHubApiClient } from '@christianlet/github-api-client';

export const getBranch = async (owner: string, repo: string, branch: string) => {
    const factory = new GitHubApiClient()
    const octokit = await factory.generate()

    let exists = false

    await octokit.repos.getBranch({
        owner,
        repo,
        branch,
    })
    .then(results => {
        exists = results.data.name === branch
    })
    .catch(e => {})

    return exists
}