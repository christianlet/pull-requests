import { Factory } from '@christianlet/github-api-client';
import { githubApiConfig } from '../github-api-config'

export const getBranch = async (owner: string, repo: string, branch: string) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

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