import { store } from '../../../store';
import { Oauth } from '../../authorizations/oauth';

export const getFiles = async (owner: string, repo: string, number: number) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    const { data } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: number
    })

    return data
}