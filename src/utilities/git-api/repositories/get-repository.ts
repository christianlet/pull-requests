import { OctokitClient } from '../../octokit-client'


export const getRepository = async (
    owner: string,
    repo: string
) => {
    const octokit = await OctokitClient.getInstance()

    return octokit.repos.get({
        owner,
        repo
    })
}