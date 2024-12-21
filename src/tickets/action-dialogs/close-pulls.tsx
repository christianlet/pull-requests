import { LoadingButton } from '@mui/lab'
import { Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import React, { useState } from 'react'
import { LongPressEventType, useLongPress } from 'use-long-press'
import { ActionDialogProps } from '.'
import { useAppDispatch } from '../../hooks/redux-hooks'
import { update } from '../../redux/reducers/peer-reviews-reducer'
import { closePullRequest } from '../../utilities/git-api/pulls/close-pull-request'
import './styles.scss'

export const ClosePulls = ({ ticket, closeDialog }: ActionDialogProps) => {
    const repos = ticket.repos
    const [aip, setAip] = useState(false)
    const [longPressInProgress, setLongPressInProgress] = useState(false)
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const dispatch = useAppDispatch()
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
                const response = await closePullRequest(repo.owner, repo.repo, repo.number)

                if(response) {
                    dispatch(update({
                        ...repo,
                        state: 'closed'
                    }))
                }
            }
        }))

        setAip(false)
    }

    return (
        <Dialog
            open={true}
            onClose={closeDialog}
            maxWidth={false}
            scroll="paper"
        >
            <DialogTitle>Repositories Associated with Ticket {ticket.info.number}</DialogTitle>
            <Divider />
            <DialogTitle>
                <DialogContentText>This will close the pull request(s) associated with this ticket from the following repositories:</DialogContentText>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'background.paper' }}>
                <List dense={true} sx={{ padding: 0, marginTop: 2 }}>
                    {
                        ticket.repos.map((repo, i) => (
                            <ListItem key={repo.id} divider={i < (ticket.repos.length - 1)}>
                                <Checkbox
                                    id={repo.id.toString()}
                                    checked={selectedRepos.indexOf(repo.id) > -1}
                                    onChange={handleCheckboxChange}
                                />
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
                    disabled={repos.filter(r => r.state === 'open').length === 0 || !selectedRepos.length}
                    disableRipple={true}
                    {...longPress()}
                    fullWidth={true}
                >Close the pull request{repos.length > 1 && 's'}</LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
