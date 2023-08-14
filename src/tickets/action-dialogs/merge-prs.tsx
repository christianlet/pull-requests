import { ErrorOutline, KeyboardBackspace } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { LongPressEventType, useLongPress } from 'use-long-press'
import { ActionDialogProps } from '.'
import { mergePullRequest } from '../../utilities/git-api/pulls/merge-pull-request'
import './styles.scss'

interface MergePRsProps extends ActionDialogProps {
    refresh: () => void
}

export const MergePRs = ({ ticket, closeDialog, refresh }: MergePRsProps) => {
    const repos = ticket.repos
    const [aip, setAip] = useState(false)
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const [toggleSelect, setToggleSelect] = useState(false)
    const [longPressInProgress, setLongPressInProgress] = useState(false)
    const longPress = useLongPress(() => handleSubmit(), {
        onStart: () => setLongPressInProgress(true),
        onFinish: () => setLongPressInProgress(false),
        onCancel: () => setLongPressInProgress(false),
        threshold: 3000,
        captureEvent: true,
        cancelOnMovement: true,
        detect: LongPressEventType.Mouse
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

        await Promise.all([...repos].map( async repo => {
            if(selectedRepos.indexOf(repo.id) > -1) {
                await mergePullRequest(repo.owner, repo.repo, repo.number)
            }

            return repo
        }))

        setSelectedRepos([])
        setAip(false)
        refresh()
    }

    return (
        <Dialog
            open={true}
            onClose={closeDialog}
            fullWidth={true}
            maxWidth="md"
            scroll="paper"
        >
            <DialogTitle>Base Branch For Repo</DialogTitle>
            <Divider />
            <DialogTitle>
                <DialogContentText>Repositories</DialogContentText>
                <DialogContentText>
                    <ListItem>
                        <Checkbox
                            checked={toggleSelect}
                            onChange={(event) => {
                                if(event.target.checked) {
                                    const repos = ticket.repos
                                        .filter(repo =>
                                            repo.mergeable && repo.mergeable_state === 'clean' && !repo.merged
                                        )
                                        .map(repo => repo.id)

                                    setSelectedRepos(repos)
                                } else {
                                    setSelectedRepos([])
                                }

                                setToggleSelect(event.target.checked)
                            }}
                        />
                        <ListItemText
                            primary={toggleSelect ? 'Unselect All' : 'Select All'}
                        />
                    </ListItem>
                </DialogContentText>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'background.paper' }}>
                <List dense={true} sx={{ marginTop: 2, padding: 0 }}>
                    {
                        repos.map((repo, i) => {
                            const selected = selectedRepos.indexOf(repo.id) > -1
                            const mergable = repo.mergeable && repo.mergeable_state === 'clean' && !repo.merged

                            return (
                                <ListItem key={repo.id} divider={i < (repos.length - 1)}>
                                    {
                                        mergable && (
                                            <Checkbox
                                                id={repo.id.toString()}
                                                checked={selected}
                                                onChange={handleCheckboxChange}
                                            />
                                        )
                                    }
                                    <ListItemText
                                        primary={repo.repo}
                                        secondaryTypographyProps={{
                                            component: 'div'
                                        }}
                                        secondary={
                                            <>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontSize: 11,
                                                        marginTop: '5px'
                                                    }}
                                                >
                                                    <Chip
                                                        label={repo.branches.base}
                                                        size="small"
                                                        color="default"
                                                        variant="filled"
                                                        className=""
                                                    />
                                                    <KeyboardBackspace fontSize="small" sx={{ marginX: 1 }}/>
                                                    <Chip
                                                        label={repo.branches.head}
                                                        size="small"
                                                        color="default"
                                                        variant="filled"
                                                        className=""
                                                    />
                                                </Box>
                                                <Box
                                                    marginTop={1}
                                                    display="flex"
                                                    alignItems="center"
                                                >
                                                    {
                                                        ['master','main'].includes(repo.branches.base) && (
                                                            <>
                                                                <ErrorOutline
                                                                    fontSize="small"
                                                                    color="warning"
                                                                />
                                                                <Typography
                                                                    color="darkorange"
                                                                    fontSize={12}
                                                                    marginLeft={1}
                                                                >Targeting {repo.branches.base} branch</Typography>
                                                            </>
                                                        )
                                                    }
                                                </Box>
                                            </>
                                        }
                                    />
                                </ListItem>
                            )
                        })
                    }
                </List>
            </DialogContent>
            <DialogActions>
                <LoadingButton
                    className={longPressInProgress ? 'pressing' : ''}
                    variant="contained"
                    color="info"
                    loading={aip}
                    disabled={selectedRepos.length === 0}
                    disableRipple={true}
                    {...longPress}
                    fullWidth={true}
                >Merge Pull Request{selectedRepos.length > 1 && 's'}</LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
