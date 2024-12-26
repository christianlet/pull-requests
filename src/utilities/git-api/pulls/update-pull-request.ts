
import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

export const updatePullRequest = async (params: RestEndpointMethodTypes["pulls"]["update"]["parameters"]) => {
    const octokit = await OctokitClient.getInstance()
    const response = await octokit.pulls.update({
        ...params,
        maintainer_can_modify: false
    })

    return response.status === 200
}