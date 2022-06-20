import { BaseRequest } from '../BaseRequest'


export class RequestReviewer extends BaseRequest {
    public run(...args: unknown[]): Promise<unknown> {
        
    }
}


export const requestDevBranch = async (owner: string, repo: string, pullNumber: number) => {
    const factory = new Factory()
    const octokit = await factory.generate()
    const devBranchManager = process.env.REACT_APP_DEV_BRANCH_MANAGER

    if(!devBranchManager) {
        return false
    }

    const response = await octokit.pulls.requestReviewers({
        owner,
        repo,
        pull_number: pullNumber,
        reviewers: [
            devBranchManager
        ]
    })

    return response.status === 201
        ? response.data.requested_reviewers
        : false
}