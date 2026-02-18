import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { Octokit } from '@octokit/rest'
import { WithId } from 'mongodb'
import { MongoDb } from '../../clients/mongo-db'
import { CollectionName } from '../../enums/collection-name'
import { PullRequestFull } from '../../types/collections'
import { getPullRequestReviews } from './getPullRequestReviewers'
import { getTags } from './getTags'

export const getFullPullRequests = async (
    octokit: Octokit,
    issues: RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'],
    hardFetch: boolean
): Promise<WithId<PullRequestFull>[]> => {
    const collection = MongoDb.getCollection(CollectionName.PULL_REQUESTS)
    const writeToCollection: PullRequestFull[] = []

    const fullPrs = await Promise.all(
        issues.map(async issue => {
            const repositoryUrl = issue.repository_url.split('/')
            const repo = repositoryUrl.pop()
            const owner = repositoryUrl.pop()
            const pullNumber = parseInt(issue.pull_request?.url?.split('/').pop() ?? '0', 10)

            if (!repo || !owner || !pullNumber) {
                return
            }

            let existingLocalData = await collection.findOne({ node_id: issue.node_id })

            try {
                const { headers, data } = await octokit.pulls.get({
                    owner,
                    repo,
                    pull_number: pullNumber,
                    headers: hardFetch ? {} : {
                        'If-Modified-Since': existingLocalData?.lastModifiedDate
                    }
                })

                console.log(`PR ${owner}/${repo}/${pullNumber} fetched from github`)

                existingLocalData = {
                    ...data,
                    reviewers: await getPullRequestReviews(octokit, owner, repo, pullNumber),
                    tags: await getTags(octokit, owner, repo, data.head.ref),
                    lastModifiedSince: headers['last-modified']
                } as unknown as WithId<PullRequestFull>

                writeToCollection.push(existingLocalData)
            } catch (error) {
                if (error.status === 304) {
                    console.log(`PR ${owner}/${repo}/${pullNumber} has no changes since last fetch ${existingLocalData?.lastModifiedDate}`)
                } else {
                    console.error(error)
                }
            }

            return existingLocalData
        })
    )

    if (writeToCollection.length) {
        await collection.bulkWrite(
            writeToCollection.map(pr => ({
                updateOne: {
                    filter: { node_id: pr.node_id },
                    update: { $set: pr },
                    upsert: true
                }
            }))
        )
    }

    return fullPrs.filter((pr): pr is WithId<PullRequestFull> => !!pr)
}