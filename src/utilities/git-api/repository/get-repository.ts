import { Factory } from '@christianlet/github-api-client'
import { githubApiConfig } from '../github-api-config'

export const getRepository = async (
    owner: string,
    repo: string
) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

    return octokit.repos.get({
        owner,
        repo
    })
}