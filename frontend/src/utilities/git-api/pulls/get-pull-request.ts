
import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

export const getPullRequest = async (args: RestEndpointMethodTypes["pulls"]["get"]["parameters"], lastModifiedSince: string = '') => {
    const octokit = await OctokitClient.getInstance()

    const res = await octokit.pulls.get({
        ...args,
        headers:
            lastModifiedSince
            ? { "If-Modified-Since": lastModifiedSince }
            : {}
    })

    return res
}