import { BaseRequest } from '../BaseRequest'


export class GetBranch extends BaseRequest {
    public async run(owner: string, repo: string, branch: string): Promise<unknown> {
        const response = await this.api.repos.getBranch({
            owner,
            repo,
            branch
        })

        return response.status === 200
    }
}
