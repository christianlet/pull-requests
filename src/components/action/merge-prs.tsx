import { Box, Button, Checkbox, FormControl, FormControlLabel } from '@mui/material'
import './styles.scss'
import { ActionProps } from './types/action-props'
import { useState } from 'react'
import { BranchTable } from '../branch-table'
import { LongPress } from '../long-press'
import { useNavigate } from 'react-router-dom'
import { mergeAndCreatePr } from '../../utilities/merge-and-create-pr'

export const MergePRs = (props: ActionProps) => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [createPullRequest, setCreatePullRequest] = useState(true)
    const submit = async () => {
        setIsSubmitting(true)

        for (const repo of props.selectedRepos) {
            await mergeAndCreatePr(repo, createPullRequest)
        }

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
