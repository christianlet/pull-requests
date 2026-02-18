
import { RequestHandler } from 'express'
import { MongoDb } from '../../../clients/mongo-db'
import { OctokitClient } from '../../../clients/octokit-client'
import { CollectionName } from '../../../enums/collection-name'
import { GitHubRequest } from '../types'

export const search: RequestHandler = async (req: GitHubRequest, res) => {
    try {
        const octokit = OctokitClient.getInstance(req.user)
        const usersCollection = MongoDb.getCollection(CollectionName.USERS)
        const { data: teams } = await octokit.teams.listForAuthenticatedUser()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersToAdd: any[] = []
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

        for (const member of allMembers) {
            const memberExists = existingMembers.find(em => em.login === member.login)

            if (!memberExists) {
                usersToAdd.push(member)
            }
        }

        let response

        if (usersToAdd.length) {
            response = await usersCollection.insertMany(usersToAdd)
        }

        console.log({
            membersMissingFromGitHub: usersToAdd.length,
            membersAddedToCollection: response?.insertedCount || 0,
            existingMembersInCollection: existingMembers.length,
            totalGitHubTeamMembers: allMembers.length
        })

        return res.status(200).json({
            items: allMembers
        })
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}