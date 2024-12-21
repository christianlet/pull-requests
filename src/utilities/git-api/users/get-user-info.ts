import { Factory } from '@christianlet/github-api-client'
import { githubApiConfig } from '../github-api-config'

export const getUserInfo = async (login: string) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

    const { data } = await octokit.users.getByUsername({
        username: login
    })

    return data
}