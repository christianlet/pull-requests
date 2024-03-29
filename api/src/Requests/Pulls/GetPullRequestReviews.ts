import { BaseRequest } from '../BaseRequest'


export class GetPullRequestReviews extends BaseRequest {
    public async run(owner: string, repo: string, pullNumber: number): Promise<unknown> {
        const { data } = await this.api.pulls.listReviews({
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
}
