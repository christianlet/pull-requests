import { store } from '../../../store'
import { Factory } from '../../authorizations/factory'

export const getPullRequest = async (owner: string, repo: string, pullNumber: number, hasLocalStorage: boolean) => {
    const factory = new Factory()
    const octokit = await factory.generate()

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