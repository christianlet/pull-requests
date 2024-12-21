import { Factory } from '@christianlet/github-api-client'
import { githubApiConfig } from '../github-api-config'

export const getAuthenticatedUser = async () => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

    const { data } = await octokit.users.getAuthenticated()

    return data
}