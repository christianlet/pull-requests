import { UpdatePullRequest } from './UpdatePullRequest'


export class ClosePullRequest extends UpdatePullRequest {
    public run(owner: string, repo: string, pullNumber: number) {
        return super.run(owner, repo, pullNumber, {
            state: 'closed'
        })
    }
}
