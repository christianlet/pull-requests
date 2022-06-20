import { BaseRequest } from '../BaseRequest'


export class MergePullRequest extends BaseRequest {
    public async run(owner: string, repo: string, pullNumber: number, params?: Object) {
        const response = await this.api.pulls.merge({
            owner,
            repo,
            pull_number: pullNumber,
            ...params,
            maintainer_can_modify: true
        })

        return response.data.merged
    }
}
