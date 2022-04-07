import { Factory } from '../../authorizations/factory'

export const mergePullRequest = async (owner: string, repo: string, pullNumber: number, params?: Object) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    const response = await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pullNumber,
        ...params,
        maintainer_can_modify: true
    })

    return response.data.merged
}