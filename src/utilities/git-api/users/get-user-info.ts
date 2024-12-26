
import { OctokitClient } from '../../octokit-client'

export const getUserInfo = async (login: string) => {
    const octokit = await OctokitClient.getInstance()
    const { data } = await octokit.users.getByUsername({
        username: login
    })

    return data
}