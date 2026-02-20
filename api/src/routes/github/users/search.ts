
import { RequestHandler } from 'express'
import { WithId } from 'mongodb'
import { MongoDb } from '../../../clients/mongo-db'
import { OctokitClient } from '../../../clients/octokit-client'
import { CollectionName } from '../../../enums/collection-name'
import { User } from '../../../types/collections'
import { GitHubRequest } from '../types'

export const search: RequestHandler = async (req: GitHubRequest, res) => {
    const hardFetch = req.query.hardFetch === 'true'

    try {
        const octokit = OctokitClient.getInstance(req.user)
        const usersCollection = MongoDb.getCollection(CollectionName.USERS)
        const { data: teams } = await octokit.teams.listForAuthenticatedUser()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersToUpdate: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allMembers: any[] = []

        for (const team of teams) {
            const { data: members } = await octokit.teams.listMembersInOrg({
                org: team.organization.login,
                team_slug: team.slug,
                per_page: 1000
            })

            for (const member of members) {
                const memberExists = allMembers.find(am => am.login === member.login)

                if (!memberExists) {
                    allMembers.push(member)
                }
            }
        }

        const existingMembers = await usersCollection.find({
            $or: allMembers.map(m => ({
                login: m.login
            }))
        }).toArray()

        await Promise.all(
            allMembers.map(async member => {
                let memberData = existingMembers.find(em => em.login === member.login)

                try {
                    const userInfo = await octokit.users.getByUsername({
                        username: member.login,
                        headers: hardFetch ? {} : {
                            'If-Modified-Since': memberData?.lastModifiedDate
                        }
                    })

                    memberData = {
                        ...userInfo.data,
                        lastModifiedDate: userInfo.headers['last-modified']
                    } as WithId<User>

                    usersToUpdate.push(memberData)
                } catch (error) {
                    if (error.status === 304) {
                        console.log(`User ${member.login} has no changes since last fetch ${memberData?.lastModifiedDate}`)
                    } else {
                        console.error(error)
                    }
                }

                return memberData
            })
        )

        let response

        if (usersToUpdate.length) {
            response = await usersCollection.bulkWrite(
                usersToUpdate.map(user => ({
                    updateOne: {
                        filter: { login: user.login },
                        update: { $set: user },
                        upsert: true
                    }
                }))
            )

            console.log(response)
        }

        const params = req.query
        const size = params.size ? parseInt(params.size as string) : 1000
        const page = params.page ? parseInt(params.page as string) : 1
        const q = params.q as string
        let filters = {}

        if (q) {
            filters = {
                $or: [
                    {
                        name: new RegExp(q, 'i')
                    },
                    {
                        login: new RegExp(q, 'i')
                    }
                ]
            }
        }

        const result = await usersCollection.find(filters)
            .limit(size)
            .skip((page - 1) * size)
            .sort({
                name: 'asc',
                login: 'asc'
            })
            .toArray()

        return res.status(200).json({
            items: result
        })
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}