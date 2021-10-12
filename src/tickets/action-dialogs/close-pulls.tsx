import { AccountTree } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import React, { useState } from 'react'
import { LongPressDetectEvents, useLongPress } from 'use-long-press'
import { ActionDialogProps } from '.'
import { useAppDispatch } from '../../hooks/redux-hooks'
import { update } from '../../redux/reducers/peer-reviews-reducer'
import { closePullRequest } from '../../utilities/github-api'
import './styles.scss'

export const ClosePulls = ({ ticket, closeDialog }: ActionDialogProps) => {
    const repos = ticket.repos
    const [aip, setAip] = useState(false)
    const [longPressInProgress, setLongPressInProgress] = useState(false)
    const dispatch = useAppDispatch()
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
                dispatch(update({
                    ...repo,
                    state: 'closed'
                }))
            }

            setAip(false)
        })
    }

    return (
        <Dialog
            open={true}
            onClose={closeDialog}
            maxWidth={false}
            scroll="paper"
        >
            <DialogTitle>Repositories Associated with Ticket {ticket.ticket}</DialogTitle>
            <Divider />
            <DialogTitle>
                <DialogContentText>This will close the pull request(s) associated with this ticket from the following repositories:</DialogContentText>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: 'lightgray' }}>
                <List dense={true} sx={{ backgroundColor: 'white', padding: 0, marginTop: 2 }}>
                    {
                        ticket.repos.map(repo => (
                            <ListItem key={repo.id} divider={true}>
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
            </DialogContent>
            <DialogActions>
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
            </DialogActions>
        </Dialog>
    )
}
