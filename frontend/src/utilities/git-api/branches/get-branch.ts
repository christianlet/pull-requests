import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'


export const getBranch = async (
    owner: string,
    repo: string,
    branch: string
): Promise<null | RestEndpointMethodTypes["git"]["getRef"]["response"]['data']> => {
    const octokit = await OctokitClient.getInstance()

    const existingBranch = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
    })
    .catch(e => null)

    return existingBranch?.data || null
}