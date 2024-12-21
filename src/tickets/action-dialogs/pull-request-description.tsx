import { KeyboardBackspace } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemText, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { LongPressEventType, useLongPress } from 'use-long-press'
import { ActionDialogProps } from '.'
import { useAppDispatch } from '../../hooks/redux-hooks'
import { update } from '../../redux/reducers/peer-reviews-reducer'
import { updatePullRequest } from '../../utilities/git-api/pulls/update-pull-request'
import './styles.scss'
import { getCommit } from '../../utilities/git-api/pulls/get-commits'

export const PullRequestDescription = ({ ticket, closeDialog }: ActionDialogProps) => {
    const repos = ticket.repos
    const [aip, setAip] = useState(false)
    const [description, setDescription] = useState('')
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
        detect: LongPressEventType.Pointer
    })
    const setBody = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.currentTarget.value)
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
                const updated = await updatePullRequest({
                    owner: repo.owner,
                    repo: repo.repo,
                    pull_number: repo.number,
                    body: description
                })

                if(updated) {
                    dispatch(update({
                        ...repo,
                        body: description
                    }))
                }
            }

            return repo
        }))

        setSelectedRepos([])
        setDescription('')
        setAip(false)
    }
    const generateDescription = async () => {
        setAip(true)
        let message = '## PR Does\n\n'

        for (const repo of repos) {
            if(selectedRepos.indexOf(repo.id) === -1) {
                continue
            }

            message += `### ${repo.repo}\n\n`

            const commit = await getCommit({
                owner: repo.owner,
                repo: repo.repo,
                pull_number: repo.number
            })
            const commitMessages = commit.map(commit => `- ${commit.commit.message}`).filter(msg => !msg.includes('Merge'))

            message += commitMessages.join('\n') + '\n\n'
        }

        message += '# Tickets\n\n- See '

        if(ticket.info.link) {
            message += `[${ticket.info.number}](${ticket.info.link})`
        }

        setDescription(message)
        setAip(false)
    }

    useEffect(() => {
        if(selectedRepos.length === 0) {
            setToggleSelect(false)
        } else if(selectedRepos.length === repos.length) {
            setToggleSelect(true)
        }

        if(selectedRepos.length === 1) {
            const body = repos.find(repo => repo.id === selectedRepos[0])?.body

            if(body) {
                setDescription(body)
            }
        } else {
            setDescription('')
        }
    }, [selectedRepos, repos])

    return (
        <Dialog
            open={true}
            onClose={closeDialog}
            fullWidth
            maxWidth="md"
            scroll="paper"
        >
            <DialogTitle>Pull Request Description</DialogTitle>
            <Divider />
            <DialogTitle>
                <TextField
                    label="Description"
                    fullWidth={true}
                    margin="normal"
                    multiline={true}
                    rows={10}
                    disabled={aip}
                    variant="outlined"
                    value={description}
                    onChange={setBody}
                />
                <Button
                    variant="contained"
                    color="info"
                    onClick={generateDescription}
                    disabled={aip}
                >Generate</Button>
            </DialogTitle>
            <DialogTitle>
                <DialogContentText>
                    <ListItem style={{ padding: 0 }}>
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
                            primary="Repositories"
                        />
                    </ListItem>
                </DialogContentText>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'background.paper', minHeight: "75px", padding: 0 }}>
                <List dense={true} sx={{ margin: 0, padding: 0 }}>
                    {
                        repos.map((repo, i) => {
                            const selected = selectedRepos.indexOf(repo.id) > -1
                            const branch   = repo.branches.base

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
                    {...longPress()}
                    fullWidth={true}
                >Set description for repo{ticket.repos.length > 1 && 's'}</LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
