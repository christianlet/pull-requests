import { BaseRequest } from '../BaseRequest'


export class GetFiles extends BaseRequest {
    public async run(owner: string, repo: string, number: number) {
        const { data } = await this.api.pulls.listFiles({
            owner,
            repo,
            pull_number: number
        })

        return data
    }
}
