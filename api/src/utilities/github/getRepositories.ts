import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { Octokit } from '@octokit/rest'
import { WithId } from 'mongodb'
import { MongoDb } from '../../clients/mongo-db'
import { CollectionName } from '../../enums/collection-name'
import { Repository } from '../../types/collections/repository'

export const getRepositories = async (
    octokit: Octokit,
    repos: RestEndpointMethodTypes['search']['repos']['response']['data']['items'],
    hardFetch: boolean
): Promise<WithId<Repository>[]> => {
    const collection = MongoDb.getCollection(CollectionName.REPOSITORY)
    const writeToCollection: Repository[] = []

    const reposFull = await Promise.all(
        repos.map(async repo => {
            let existingLocalData = await collection.findOne({ node_id: repo.node_id })

            if (!repo.owner) {
                return
            }

            try {
                const { headers, data } = await octokit.repos.get({
                    owner: repo.owner.login,
                    repo: repo.name,
                    headers: hardFetch ? {} : {
                        'If-Modified-Since': existingLocalData?.lastModifiedDate
                    }
                })

                console.log(`Repo ${repo.owner.login}/${repo.name} fetched from github`)

                existingLocalData = {
                    ...data,
                    lastModifiedDate: headers['last-modified']
                } as unknown as WithId<Repository>

                writeToCollection.push(existingLocalData)
            } catch (error) {
                if (error.status !== 304) {
                    console.error(error)
                }
            }

            return existingLocalData
        })
    )

    if (writeToCollection.length) {
        const bulkResponse = await collection.bulkWrite(
            writeToCollection.map(pr => ({
                updateOne: {
                    filter: { node_id: pr.node_id },
                    update: { $set: pr },
                    upsert: true
                }
            }))
        )

        console.log(bulkResponse)

    }

    return reposFull.filter((repo): repo is WithId<Repository> => !!repo)
}