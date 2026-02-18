import { Octokit } from '@octokit/rest'

export const getPullRequestReviews = async (
    octokit: Octokit,
    owner: string,
    repo: string,
    pullNumber: number
) => {
    const { data } = await octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber
    })

    const filteredReviews: typeof data = []

    data.map(async review => {
        const index = filteredReviews.findIndex(r => r.user?.login === review.user?.login)

        if (index === -1) {
            filteredReviews.push(review)
        } else {
            filteredReviews[index] = review
        }
    })

    return filteredReviews.filter(r => ['APPROVED', 'CHANGES_REQUESTED'].includes(r.state))
}
