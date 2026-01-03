import { OctokitClient } from '../../octokit-client'


export const getRepositories = async (
    q = '',
    pageSize = 100,
    page = 1
) => {
    const octokit = await OctokitClient.getInstance()

    return octokit.search.repos({
        q,
        per_page: pageSize,
        page,
        sort: 'updated'
    })
}