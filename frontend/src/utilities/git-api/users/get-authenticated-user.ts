import { OctokitClient } from '../../octokit-client'


export const getAuthenticatedUser = async () => {
    const octokit = await OctokitClient.getInstance()
    const { data } = await octokit.users.getAuthenticated()

    return data
}