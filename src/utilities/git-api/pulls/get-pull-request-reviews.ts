import { GitHubApiClient } from '@christianlet/github-api-client'

export const getPullRequestReviews = async (owner: string, repo: string, pullNumber: number) => {
    const factory = new GitHubApiClient()
    const octokit = await factory.generate()

    const { data } = await octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber
    })

    const filteredReviews: typeof data = []

    data.forEach(review => {
        const index = filteredReviews
            .filter(r => r.state === 'CHANGES_REQUESTED' || r.state === 'APPROVED')
            .findIndex(r => r.user?.login === review.user?.login)

        if(index === -1) {
            filteredReviews.push(review)
        } else {
            filteredReviews[index] = review
        }
    })

    return filteredReviews
}