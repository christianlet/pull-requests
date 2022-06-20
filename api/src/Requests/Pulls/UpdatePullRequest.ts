import { BaseRequest } from '../BaseRequest'


export class UpdatePullRequest extends BaseRequest {
    public async run(owner: string, repo: string, pullNumber: number, params: Object) {
        const response = await this.api.pulls.update({
            owner,
            repo,
            pull_number: pullNumber,
            ...params,
            maintainer_can_modify: false
        })

        return response.status === 200
    }
}
