import { ErrorOutline, KeyboardBackspace } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { LongPressDetectEvents, useLongPress } from 'use-long-press'
import { ActionDialogProps } from '.'
import { useAppDispatch } from '../../hooks/redux-hooks'
import { update } from '../../redux/reducers/peer-reviews-reducer'
import { createBranch } from '../../utilities/git-api/branches/create-branch'
import { updatePullRequest } from '../../utilities/git-api/pulls/update-pull-request'
import './styles.scss'

interface Repo {
    id: number
    branchExists: boolean
    name: string|null
    errorMessage?: string
}

export const DevBranch = ({ ticket, closeDialog }: ActionDialogProps) => {
    const repos = ticket.repos
    const [aip, setAip] = useState(false)
    const [baseBranch, setBaseBranch] = useState('')
    const [selectedRepos, setSelectedRepos] = useState<number[]>([])
    const [toggleSelect, setToggleSelect] = useState(false)
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

    const setBranch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBaseBranch(e.currentTarget.value.toLowerCase().replace(/(\s)/g, '-'))
    }

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
                let created = await createBranch(repo.owner, repo.repo, baseBranch)
                    .catch(e => {
                        return true
                    })


                if(created) {
                    const updated = await updatePullRequest(repo.owner, repo.repo, repo.number, {
                        base: baseBranch
                    })

                    if(updated) {
                        repo = {
                            ...repo,
                            branches: {
                                ...repo.branches,
                                base: baseBranch
                            }
                        }

                        dispatch(update(repo))
                    }
                }
            }

            return repo
        }))

        setSelectedRepos([])
        setBaseBranch('')
        setAip(false)
    }

    return (
        <Dialog
            open={true}
            onClose={closeDialog}
            fullWidth={true}
            maxWidth="md"
            scroll="paper"
        >
            <DialogTitle>Target Branch For Repo(s)</DialogTitle>
            <Divider />
            <DialogTitle>
                <TextField
                    label="Target Branch"
                    fullWidth={true}
                    margin="normal"
                    variant="outlined"
                    value={baseBranch}
                    onChange={setBranch}
                />
            </DialogTitle>
            <DialogTitle>
                <DialogContentText>Repositories</DialogContentText>
                <DialogContentText>
                    <ListItem>
                        <Checkbox
                            checked={toggleSelect}
                            onChange={(event) => {
                                if(event.target.checked) {
                                    const repos = ticket.repos.map(repo => repo.id)

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
                            const branch   = selected && baseBranch !== '' ? baseBranch : repo.branches.base

                            return (
                                <ListItem key={repo.id} divider={i < (repos.length - 1)}>
                                    <Checkbox
                                        id={repo.id.toString()}
                                        checked={selected}
                                        onChange={handleCheckboxChange}
                                    />
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
                                                        label={branch}
                                                        size="small"
                                                        color={selected && baseBranch ? 'info' : 'default'}
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
                                                        ['master','main'].includes(branch) && (
                                                            <>
                                                                <ErrorOutline
                                                                    fontSize="small"
                                                                    color="warning"
                                                                />
                                                                <Typography
                                                                    color="darkorange"
                                                                    fontSize={12}
                                                                    marginLeft={1}
                                                                >Targeting {branch} branch</Typography>
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
                    disabled={baseBranch === '' || selectedRepos.length === 0}
                    disableRipple={true}
                    {...longPress}
                    fullWidth={true}
                >Set target branch for repo{ticket.repos.length > 1 && 's'}</LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
