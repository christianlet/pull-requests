import { OctokitClient } from '../../octokit-client'


export const getOpenPullRequests = async (
    reviewing: boolean,
    author: string,
    state: 'open' | 'closed',
    page: string
) => {
    const octokit = await OctokitClient.getInstance()
    let query = `author:${author}`

    if(reviewing) {
        query = 'review-requested:@me'

        if(author !== '') {
            query += `+author:${author}`
        }
    }

    const { data } = await octokit.search.issuesAndPullRequests({
        q: `${query}+is:pr+is:${state}`,
        sort: 'created',
        per_page: 50,
        page: parseInt(page, 10)
    })

    return data
}