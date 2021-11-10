import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth';

export const getPullRequest = async (owner: string, repo: string, pullNumber: number, hasLocalStorage: boolean) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    const lastSearched = sessionStorage.getItem('lastSearched')

    const { data } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        headers:
            lastSearched && hasLocalStorage
            ? { "If-Modified-Since": lastSearched }
            : {}
    })

    return data
}