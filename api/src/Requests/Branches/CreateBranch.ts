import { BaseRequest } from '../BaseRequest'
import { GetBranch } from './GetBranch'



export class CreateBranch extends BaseRequest{
    public async run(owner: string, repo: string, branch: string): Promise<unknown> {
        let response = GetBranch()

        if(!response) {
            try {
                response = await this.api.repos.getBranch({ owner, repo, branch: 'main' })
            } catch (error) {
                console.log('Main branch does not exist')
                return false
            }
        }

        const res = await this.api.request('POST /repos/{owner}/{repo}/git/refs', {
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha: response.data.commit.sha
        })

        return res.status === 201
    }
}
