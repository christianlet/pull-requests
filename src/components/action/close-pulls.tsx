import { LoadingButton } from '@mui/lab'
import { Checkbox, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material'
import React, { useState } from 'react'
import { LongPressEventType, useLongPress } from 'use-long-press'
import { closePullRequest } from '../../utilities/git-api/pulls/close-pull-request'
import './styles.scss'
import { useBranchPrs } from '../../hooks/branch-prs'
import { useSearchParams } from 'react-router-dom'
import { Title } from '@mui/icons-material'

export const ClosePulls = () => {
    const [searchParams] = useSearchParams()
    const branch = searchParams.get('branch') ?? ''
    const repos = useBranchPrs(branch)
    const [aip, setAip] = useState(false)
    const [longPressInProgress, setLongPressInProgress] = useState(false)
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const longPress = useLongPress(() => handleSubmit(), {
        onStart: () => setLongPressInProgress(true),
        onFinish: () => setLongPressInProgress(false),
        onCancel: () => setLongPressInProgress(false),
        threshold: 3000,
        captureEvent: true,
        cancelOnMovement: true,
        detect: LongPressEventType.Pointer
    })

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(event.target.id, 10)

        if(event.target.checked) {
            setSelectedRepos([...selectedRepos, id])
        } else {
            const newSelectedRepos = [...selectedRepos]
            const index = selectedRepos.findIndex(sr => sr === id)

            newSelectedRepos.splice(index, 1)

            setSelectedRepos(newSelectedRepos)
        }
    }

    const handleSubmit = async () => {
        setAip(true)

        await Promise.all(repos.map(async repo => {
            if(selectedRepos.indexOf(repo.id) > -1) {
                const response = await closePullRequest(repo.repository.owner.login, repo.repository.name, repo.number)

                if(response) {

                }
            }
        }))

        setAip(false)
    }

    return (
        <>
            <h1>Repositories Associated with branch {branch}</h1>
            <Divider />
            <Title>This will close the pull request(s) associated with this ticket from the following repositories:</Title>
            <Paper>
                <List dense={true} sx={{ padding: 0, marginTop: 2 }}>
                    {
                        repos.map((repo, i) => (
                            <ListItem key={repo.id} divider={i < (repos.length - 1)}>
                                <Checkbox
                                    id={repo.id.toString()}
                                    checked={selectedRepos.indexOf(repo.id) > -1}
                                    onChange={handleCheckboxChange}
                                />
                                <ListItemText
                                    primary={repo.repository.name}
                                    secondary={repo.node_id}
                                    slotProps={{
                                        secondary: {
                                            fontSize: '11px'
                                        }
                                    }}
                                />
                                <ListItemIcon>
                                    <Chip
                                        label={repo.state}
                                        color={repo.state === 'closed' ? 'error' : 'success'}
                                        sx={{
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </ListItemIcon>
                            </ListItem>
                        ))
                    }
                </List>
            </Paper>
            <div>
                <LoadingButton
                    className={longPressInProgress ? 'pressing' : ''}
                    variant="contained"
                    color="error"
                    loading={aip}
                    disabled={repos.filter(r => r.state === 'open').length === 0 || !selectedRepos.length}
                    disableRipple={true}
                    {...longPress()}
                    fullWidth={true}
                >Close the pull request{repos.length > 1 && 's'}</LoadingButton>
            </div>
        </>
    )
}
