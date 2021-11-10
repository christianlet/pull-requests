import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth'

export const getBranch = async (owner: string, repo: string, branch: string) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    let exists = false

    await octokit.repos.getBranch({
        owner,
        repo,
        branch
    })
    .then(results => exists = results.status === 200)
    .catch(e => {})

    return exists
}