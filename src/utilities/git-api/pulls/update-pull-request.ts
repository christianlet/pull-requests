import { Factory } from '@christianlet/github-api-client'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { githubApiConfig } from '../github-api-config'

export const updatePullRequest = async (params: RestEndpointMethodTypes["pulls"]["update"]["parameters"]) => {
    const factory = new Factory()
    const octokit = await factory.generate(githubApiConfig)

    const response = await octokit.pulls.update({
        ...params,
        maintainer_can_modify: false
    })

    return response.status === 200
}