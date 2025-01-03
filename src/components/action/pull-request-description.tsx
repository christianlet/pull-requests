import { Button, Paper, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import './styles.scss'
import { getCommit } from '../../utilities/git-api/pulls/get-commits'
import { jiraTicket } from '../../utilities/jira-ticket'
import { ActionProps } from './types/action-props'
import { OctokitClient } from '../../utilities/octokit-client'
import { LongPress } from '../long-press'
import { useNavigate } from 'react-router-dom'
import { BranchTable } from '../branch-table'
import { sleep } from '../../utilities/sleep'

export const PullRequestDescription = ({ repos, selectedRepos, branch, setRefreshRepos, ...props }: ActionProps) => {
    const navigate = useNavigate()
    const [asyncInProgress, setAsyncInProgress] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [body, setBody] = useState('')

    const generateDescription = async () => {
        setAsyncInProgress(true)

        const isPersonalBranch = selectedRepos.filter(repo => repo.head.ref.match(/^personal/)).length > 0
        const isReleaseBranch = selectedRepos.filter(repo => repo.head.ref.match(/\/release\/(.*)$/)).length > 0
        const releaseFound = selectedRepos[0].head.ref.match(/^collab\/(.*)\/release\/(.*)$/)
        const team = releaseFound?.[1] ?? ''
        const release = releaseFound?.[2] ?? ''

        let message = ''

        if(isPersonalBranch) {
            message = '## PR Does\n\n'
        } else if (isReleaseBranch) {
            message = `## Release\n\n`

            if(team) {
                message += `Team: **${team}**\n`
            }

            if(release) {
                message += `Release: **${release}**\n`
            }
        }

        if (isReleaseBranch) {
            message += '\n### Pull Requests\n\n'
        }

        for (const repo of selectedRepos) {
            message += `#### [${repo.base.repo.name} #${repo.number}](${repo.html_url})\n\n`

            const commit = await getCommit({
                owner: repo.base.repo.owner.login,
                repo: repo.base.repo.name,
                pull_number: repo.number
            })
            const commitMessages = commit.map(commit => `- ${commit.commit.message}`).filter(msg => !msg.includes('Merge'))

            message += `${commitMessages.join('\n')}\n\n`
        }

        if(isPersonalBranch) {
            message += '## Tickets\n\n- See '
        }

        const ticket = branch.split('/').pop() ?? ''
        const jiraLink = jiraTicket(ticket)

        if(jiraLink) {
            message += `[${ticket}](${jiraLink})`
        }

        setBody(message)

        setAsyncInProgress(false)
    }
    const submit = async () => {
        if(body === '') {
            return
        }

        setIsSubmitting(true)

        const client = await OctokitClient.getInstance()

        for (const repo of selectedRepos) {
            try {
                await client.pulls.update({
                    owner: repo.base.repo.owner.login,
                    repo: repo.base.repo.name,
                    pull_number: repo.number,
                    body
                })
            } catch (error) {
                console.error(error)
            }
        }

        await sleep(1000)

        setIsSubmitting(false)
        setRefreshRepos(new Date().getTime())
    }

    useEffect(() => {
      if(selectedRepos.length !== 1) {
        setBody('')
      } else {
        setBody(selectedRepos[0].body ?? '')
      }
    }, [selectedRepos])

    return (
        <div>
            <div style={{ marginBottom: 25 }}>
                <TextField
                    label="Description"
                    fullWidth={true}
                    margin="normal"
                    multiline={true}
                    rows={10}
                    disabled={asyncInProgress}
                    variant="filled"
                    value={body}
                    onChange={e => setBody(e.target.value)}

                />
                <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={generateDescription}
                    disabled={asyncInProgress}
                >Generate</Button>
            </div>
            <BranchTable
                repos={repos || []}
                loadingRepos={repos === null}
                selectedRepos={selectedRepos}
                aip={isSubmitting}
                setSelectedRepos={props.setSelectedRepos}
            />
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 25
            }}>
                <Button
                    color="error"
                    variant="outlined"
                    disabled={isSubmitting}
                    onClick={() => navigate('/prs')}
                    sx={{ marginRight: 2 }}
                >Back</Button>
                <LongPress
                    loading={isSubmitting}
                    disabled={selectedRepos.length === 0}
                    onSubmit={submit}
                />
            </div>
        </div>
    )
}
