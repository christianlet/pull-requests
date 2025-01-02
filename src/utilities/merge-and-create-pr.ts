import { PullRequestFull } from '../types/api-types'
import { OctokitClient } from './octokit-client'

export const mergeAndCreatePr = async (branch: PullRequestFull, createPullRequest = true) => {
    const client = await OctokitClient.getInstance()

    if(!branch.mergeable || branch.mergeable_state !== 'clean') {
        return null
    }

    try {
        const response = await client.pulls.merge({
            owner: branch.base.repo.owner.login,
            repo: branch.base.repo.name,
            pull_number: branch.number,
            merge_method: 'merge'
        })

        if(createPullRequest && branch.base.repo.default_branch !== branch.base.ref) {
            const prExists = await client.pulls.list({
                owner: branch.base.repo.owner.login,
                repo: branch.base.repo.name,
                head: `${branch.base.repo.owner.login}:${branch.base.ref}`,
                base: branch.base.repo.default_branch
            })

            if(!prExists.data.length) {
                await client.pulls.create({
                    owner: branch.base.repo.owner.login,
                    repo: branch.base.repo.name,
                    title: branch.title,
                    head: branch.base.ref,
                    base: branch.base.repo.default_branch
                })
            }
        }

        await sleep(1000)

        return response
    } catch (error) {
        console.error(error)
    }

    return null
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
