
import { RestEndpointMethodTypes } from '@octokit/rest'
import { OctokitClient } from '../../octokit-client'

export const getCommit = async (arg: RestEndpointMethodTypes["pulls"]["listCommits"]["parameters"]) => {
    const octokit = await OctokitClient.getInstance()
    const { data } = await octokit.pulls.listCommits(arg)

    return data
}
