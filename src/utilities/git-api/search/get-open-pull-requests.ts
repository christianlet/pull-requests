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

    const res = await octokit.search.issuesAndPullRequests({
        q: `${query}+is:pr+is:${state}`,
        sort: 'updated',
        per_page: 30,
        page: parseInt(page, 10)
    })

    return res.data
}