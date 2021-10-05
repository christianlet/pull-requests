import { AccountTree } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Chip, Dialog, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { LongPressDetectEvents, useLongPress } from 'use-long-press'
import { ActionDialogProps } from '.'
import { closePullRequest } from '../../utilities/github-api'
import './styles.scss'

export const ClosePulls = ({ ticket, closeDialog }: ActionDialogProps) => {
    const [repos, setRepos] = useState(ticket.repos)
    const [aip, setAip] = useState(false)
    const [longPressInProgress, setLongPressInProgress] = useState(false)
    const longPress = useLongPress(() => handleSubmit(), {
        onStart: () => setLongPressInProgress(true),
        onFinish: () => setLongPressInProgress(false),
        onCancel: () => setLongPressInProgress(false),
        threshold: 3000,
        captureEvent: true,
        cancelOnMovement: true,
        detect: LongPressDetectEvents.BOTH
    })


    const handleSubmit = async () => {
        repos.forEach(async repo => {
            setAip(true)

            const response = await closePullRequest(repo.owner, repo.repo, repo.number)

            if(response) {
                repos.map(repoState => {
                    if(repo.id === repoState.id) {
                        repo.state = 'closed'
                    }

                    return repo
                })

                setRepos([...repos])
            }

            setAip(false)
        })
    }

    return (
        <Dialog
            open={true}
            onClose={closeDialog}
            maxWidth={false}
            scroll="body"
        >
            <DialogTitle>Repositories Associated with Ticket {ticket.ticket}</DialogTitle>
            <Divider />
            <DialogContent>
                <DialogContentText>This will close the pull request(s) associated with this ticket from the following repositories:</DialogContentText>
                <List dense={true}>
                    {
                        ticket.repos.map(repo => (
                            <ListItem key={repo.id}>
                                <ListItemIcon>
                                    <AccountTree fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={repo.repo}
                                    secondary={repo.branches.head}
                                    secondaryTypographyProps={{
                                        fontSize: '11px'
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
                <Box marginTop="25px">
                    <LoadingButton
                        className={longPressInProgress ? 'pressing' : ''}
                        variant="contained"
                        color="error"
                        loading={aip}
                        disabled={repos.filter(r => r.state === 'open').length === 0}
                        disableRipple={true}
                        {...longPress}
                        fullWidth={true}
                    >Close the pull request{repos.length > 1 && 's'}</LoadingButton>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
