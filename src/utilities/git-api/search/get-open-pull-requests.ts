import { Factory } from '../../authorizations/factory'

export const getOpenPullRequests = async (
    reviewing: boolean,
    author: string,
    state: 'open' | 'closed',
    page: number
) => {
    const factory = new Factory()
    const octokit = await factory.generate()

    let query = `author:${author}`

    if(reviewing) {
        query = 'review-requested:@me'

        if(author !== '') {
            query += `+author:${author}`
        }
    }

    const { data } = await octokit.search.issuesAndPullRequests({
        q: `${query}+is:pr+is:${state}`,
        sort: 'updated',
        per_page: 100,
        page,
    })

    return data
}