import { RestEndpointMethodTypes } from '@octokit/rest'
import { BaseRequest } from './BaseRequest'
import { PullRequest } from './PullRequest'
import { UserRequest } from './UserRequest'



type SearchRequestItem = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["response"]["data"]["items"][0]


export class SearchRequest extends BaseRequest {
    public async openPullRequests(
        author: string,
        state: 'open' | 'closed',
        page: number
    ) {
        let query = `author:${author}`

        const { data } = await this.api.search.issuesAndPullRequests({
            q: `${query}+is:pr+is:${state}`,
            sort: 'updated',
            per_page: 25,
            page,
        })

        return data
    }

    protected async mapPullRequests(owner: string, repo: string, pullNumber: number) {
        try {
            const pullRequest = new PullRequest(owner, repo, pullNumber)
            const prInfo = await pullRequest.getPullRequest()
            const reviews = await pullRequest.getPullRequestReviews()
            const reviewers = Promise.all(
                reviews
                    .filter(review => review.state === 'APPROVED' || review.state === 'CHANGES_REQUESTED')
                    .map(review => ({
                        ...review,
                        user: this.mapUserInfo(review.user?.login ?? '')
                    }))
            )

            return {
                ...prInfo,
                repo,
                owner,
                reviewers,
                branches: {
                    head: prInfo.head.ref,
                    base: prInfo.base.ref
                },
                user: this.mapUserInfo(prInfo.user?.login ?? '')
            }
        } catch (error) {

        }
    }

    protected mapUserInfo(login: string) {

    }

}
