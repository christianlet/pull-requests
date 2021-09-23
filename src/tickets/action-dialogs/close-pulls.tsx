import { AccountTree, Circle } from '@mui/icons-material'
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { ActionDialogProps } from '.'

export const ClosePulls = ({ ticket }: ActionDialogProps) => {
    const [confirmText, setConfirmText] = useState('')

    return (
        <>
            <DialogTitle>Repositories Associated with Ticket {ticket.ticket}</DialogTitle>
            <Divider />
            <DialogContent>
                <DialogContentText>This will close the pull request(s) associated with this ticket from the following repositories:</DialogContentText>
                <List dense={true}>
                    {
                        ticket.repos.map(repo => (
                            <ListItem>
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
                            </ListItem>
                        ))
                    }
                </List>
                <DialogContentText>This action <b>cannot</b> be undone.</DialogContentText>
                <DialogContentText>Please type <b>{ticket.ticket}</b> to confirm.</DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={confirmText}
                    onChange={event => setConfirmText(event.target.value)}
                />
                <Box marginTop="25px">
                    <Button
                        variant="contained"
                        color="error"
                        disabled={confirmText !== ticket.ticket}
                        fullWidth
                    >I understand the consequences, close the pull request(s)</Button>
                </Box>
            </DialogContent>
        </>
    )
}
