import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth';

export const mergePullRequest = async (owner: string, repo: string, pullNumber: number, params?: Object) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    const response = await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pullNumber,
        ...params,
        maintainer_can_modify: true
    })

    return response.data.merged
}