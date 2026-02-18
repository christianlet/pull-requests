
import { RequestHandler } from 'express'
import { MongoDb } from '../../../clients/mongo-db'
import { OctokitClient } from '../../../clients/octokit-client'
import { CollectionName } from '../../../enums/collection-name'
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

                const existingMember = existingMembers.find(em => em.login === member.login)

                try {
                    const userInfo = await octokit.users.getByUsername({
                        username: member.login,
                        headers: hardFetch ? {} : {
                            'If-Modified-Since': existingMember?.lastModifiedDate
                        }
                    })

                    usersToUpdate.push({
                        ...userInfo.data,
                        lastModifiedDate: userInfo.headers['last-modified']
                    })
                } catch (error) {
                    if (error.status === 304) {
                        console.log(`User ${member.login} has no changes since last fetch ${existingMember?.lastModifiedDate}`)
                    } else {
                        console.error(error)
                    }
                }
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


        return res.status(200).json({
            items: allMembers
        })
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}