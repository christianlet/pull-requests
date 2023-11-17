import { GitHubApiClient } from '@christianlet/github-api-client'

export const getUserInfo = async (login: string) => {
    const factory = new GitHubApiClient()
    const octokit = await factory.generate()

    const { data } = await octokit.users.getByUsername({
        username: login
    })

    return data
}