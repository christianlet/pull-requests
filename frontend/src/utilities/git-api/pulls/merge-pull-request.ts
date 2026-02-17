import { OctokitClient } from '../../octokit-client'


export const mergePullRequest = async (owner: string, repo: string, pullNumber: number, params?: Object) => {
    const octokit = await OctokitClient.getInstance()
    const response = await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pullNumber,
        ...params,
        maintainer_can_modify: true
    })

    return response
}