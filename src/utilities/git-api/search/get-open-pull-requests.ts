import { store } from '../../../store'
import { Oauth } from '../../authorizations/oauth';

export const getOpenPullRequests = async (reviewing: boolean, author: string, page: number) => {
    const token = store.getState().token.value

    if(!token) {
        throw new Error("Octokit not configured");
    }

    const auth = new Oauth(token)
    const octokit = await auth.generate()

    let query = `author:${author}`

    if(reviewing) {
        query = 'review-requested:@me'

        if(author !== '') {
            query += `+author:${author}`
        }
    }

    const { data } = await octokit.search.issuesAndPullRequests({
        q: `${query}+is:pr+is:open`,
        sort: 'created',
        per_page: 50,
        page,
    })

    return data
}