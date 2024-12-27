import { Box, Button, Checkbox, FormControl, FormControlLabel } from '@mui/material'
import './styles.scss'
import { ActionProps } from './types/action-props'
import { useState } from 'react'
import { BranchTable } from '../branch-table'
import { LongPress } from '../long-press'
import { useNavigate } from 'react-router-dom'
import { OctokitClient } from '../../utilities/octokit-client'

export const MergePRs = (props: ActionProps) => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [createPullRequest, setCreatePullRequest] = useState(true)
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const submit = async () => {
        setIsSubmitting(true)

        const client = await OctokitClient.getInstance()

        for (const repo of props.selectedRepos) {
            if(!repo.mergeable || repo.mergeable_state !== 'clean') {
                continue
            }

            try {
                await client.pulls.merge({
                    owner: repo.base.repo.owner.login,
                    repo: repo.base.repo.name,
                    pull_number: repo.number,
                    merge_method: 'merge'
                })

                if(createPullRequest && repo.base.repo.default_branch !== repo.base.ref) {
                    const prExists = await client.pulls.list({
                        owner: repo.base.repo.owner.login,
                        repo: repo.base.repo.name,
                        head: `${repo.base.repo.owner.login}:${repo.base.ref}`,
                        base: repo.base.repo.default_branch
                    })

                    if(!prExists.data.length) {
                        await client.pulls.create({
                            owner: repo.base.repo.owner.login,
                            repo: repo.base.repo.name,
                            title: repo.title,
                            head: repo.base.ref,
                            base: repo.base.repo.default_branch
                        })
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }

        await sleep(1000)

        setIsSubmitting(false)
        props.setRefreshRepos(new Date().getTime())
    }

    return (
        <div>
            <Box marginTop={2}>
                <FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={createPullRequest}
                                onChange={() => setCreatePullRequest(!createPullRequest)}
                            />
                        }
                        label="Create Pull Request on merge"
                    />
                </FormControl>
            </Box>
            <BranchTable
                repos={props.repos || []}
                loadingRepos={props.repos === null}
                selectedRepos={props.selectedRepos}
                aip={isSubmitting}
                setSelectedRepos={props.setSelectedRepos}
                hideUnmergeable={true}
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
                    disabled={props.selectedRepos.length === 0}
                    onSubmit={submit}
                />
            </div>
        </div>
    )
}