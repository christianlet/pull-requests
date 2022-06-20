import { BaseRequest } from '../BaseRequest'


export class GetPullRequest extends BaseRequest {
    public async run(owner: string, repo: string, pullNumber: number, lastSearched?: string) {
        const { data } = await this.api.pulls.get({
            owner,
            repo,
            pull_number: pullNumber,
            headers:
                lastSearched
                ? { "If-Modified-Since": lastSearched }
                : {}
        })

        return data
    }
}
