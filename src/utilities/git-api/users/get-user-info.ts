import { Factory } from '@christianlet/github-api-client'

export const getUserInfo = async (login: string) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    const { data } = await octokit.users.getByUsername({
        username: login
    })

    return data
}