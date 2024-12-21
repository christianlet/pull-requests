import { RestEndpointMethodTypes } from '@octokit/rest'
import { BaseRequest } from './BaseRequest'


export class PullRequest extends BaseRequest {
    public constructor(
        protected owner: string,
        protected repo: string,
        protected pullNumber: number
    ) {
        super()
    }

    public async updatePullRequest(params?: Partial<RestEndpointMethodTypes["pulls"]["update"]["parameters"]>) {
        const response = await this.api.pulls.update({
            owner: this.owner,
            repo: this.repo,
            pull_number: this.pullNumber,
            ...params,
            maintainer_can_modify: false
        })

        return response.status === 200
    }


    public async getFiles() {
        const { data } = await this.api.pulls.listFiles({
            owner: this.owner,
            repo: this.repo,
            pull_number: this.pullNumber
        })

        return data
    }

    public async closePullRequest() {
        return this.updatePullRequest({
            state: 'closed'
        })
    }

    public async getPullRequest(lastSearched?: null|string) {
        const { data } = await this.api.pulls.get({
            owner: this.owner,
            repo: this.repo,
            pull_number: this.pullNumber,
            headers:
                lastSearched
                ? { "If-Modified-Since": lastSearched }
                : {}
        })

        return data
    }

    public async getPullRequestReviews() {
        const { data } = await this.api.pulls.listReviews({
            owner: this.owner,
            repo: this.repo,
            pull_number: this.pullNumber
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

    public async mergePullRequest(params?: Partial<RestEndpointMethodTypes["pulls"]["merge"]["parameters"]>) {
        const response = await this.api.pulls.merge({
            owner: this.owner,
            repo: this.repo,
            pull_number: this.pullNumber,
            ...params,
            maintainer_can_modify: true
        })

        return response.data.merged
    }

    public async requestReviewer() {
        const devBranchManager = import.meta.env.REACT_APP_DEV_BRANCH_MANAGER

        if(!devBranchManager) {
            return false
        }

        const response = await this.api.pulls.requestReviewers({
            owner: this.owner,
            repo: this.repo,
            pull_number: this.pullNumber,
            reviewers: [
                devBranchManager
            ]
        })

        return response.status === 201 && response.data.requested_reviewers
            ? response.data.requested_reviewers
            : false
        }

}
