/* eslint-disable react-hooks/exhaustive-deps */
import { Alert, AlertProps, Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, FormControl, FormControlLabel, FormGroup, FormHelperText, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useNavigate, useParams } from 'react-router-dom'
import { Release, ReleaseStep } from '../../../types/releases/release'
import './styles.scss'
import { SessionStorage } from '../../../utilities/git-api/local-storage/session-storage'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch, faCodeMerge, faCodePullRequest, faX } from '@fortawesome/free-solid-svg-icons'
import { getPullRequests } from '../../../utilities/git-api/pulls/get-pull-requests'
import { stepChecks } from '../functions/step-checks'
import { PullRequestFull } from '../../../types/api-types'
import { setTargetBranch } from '../../../utilities/set-target-branch'
import { Launch } from '@mui/icons-material'
import { mergeAndCreatePr } from '../../../utilities/merge-and-create-pr'

interface FeedbackState {
    severity: AlertProps['severity']
    message: string
}

export const Edit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const releaseStorage = new SessionStorage<Release>('releases')
    const [ticket, setTicket] = useState('')
    const [searchingBranches, setSearchingBranches] = useState(false)
    const [timestamp, setTimestamp] = useState(new Date().getTime())
    const [runningAction, setRunningAction] = useState(false)
    const [feedback, setFeedback] = useState<FeedbackState>({
        severity: 'info',
        message: ''
    })
    const [formData, setFormData] = useState<Release>({
        fixVersion: '',
        fixVersionLink: '',
        createdAt: '',
        team: 'cms3',
        steps: {
            qa: {
                label: 'QA',
                scheduledAt: '',
                status: 'not-started'
            },
            regression: {
                label: 'Regression',
                scheduledAt: '',
                status: 'not-started'
            },
            production: {
                label: 'Production',
                scheduledAt: '',
                status: 'not-started'
            }
        },
        tickets: [],
        branches: []
    })

    const getPrInfo = async () => {
        setSearchingBranches(true)

        const searchQuery = formData.tickets.map(ticket => `head:personal/christianlet/${ticket}`).join(' ') + ` head:collab/${formData.team}/release/${formData.fixVersion}`
        const response = await getPullRequests({
            q: searchQuery,
            per_page: 100
        })

        const fd = {
            ...formData,
            branches: response.items.sort((a) => a.merged ? 1 : -1)
        }

        if(id) {
            releaseStorage.store(formData.fixVersion, fd)
        } else {
            setFormData(fd)
        }

        setSearchingBranches(false)
        setTimestamp(new Date().getTime())
    }

    const createReleaseBranch = async (branch: PullRequestFull) => {
        setRunningAction(true)

        try{
            const releaseBranch = `collab/${formData.team}/release/${formData.fixVersion}`
            const response = await setTargetBranch(branch, releaseBranch)

            if([200, 201].includes(response.status)) {
                setFeedback({
                    severity: 'success',
                    message: `Branch ${releaseBranch} created successfully`
                })

                await getPrInfo()
            }
        } catch(e: any) {
            setFeedback({
                severity: 'error',
                message: e.message
            })
        }

        setRunningAction(false)
    }
    const mergeBranch = async (branch: PullRequestFull) => {
        setRunningAction(true)

        const response = await mergeAndCreatePr(branch)

        if(response) {
            await getPullRequests({
                q: `head:${branch.base.ref}`,
                per_page: 1
            })

            setFeedback({
                severity: 'success',
                message: `Branch ${branch.base.ref} merged successfully`
            })
        }

        await getPrInfo()

        setRunningAction(false)
    }

    const handleSubmit = async () => {
        releaseStorage.store(formData.fixVersion, formData)

        setFeedback({
            severity: 'success',
            message: 'Release saved successfully'
        })

        navigate('/releases')
    }

    useEffect(() => {
        if(id) {
            const release = releaseStorage.get(id)

            if(release) {
                setFormData(release)
            }
        }
    }, [id, timestamp])

    return (
        <Paper elevation={5} sx={{ padding: '10px 25px' }}>
            <h2>{id ? 'Edit' : 'Create'} Release</h2>
            <Snackbar
                open={feedback.message.length > 0}
                message={feedback.message}
                autoHideDuration={6000}
                onClose={() => setFeedback({ severity: 'info', message: '' })}
            >
                <Alert
                    onClose={() => setFeedback({ severity: 'info', message: '' })}
                    severity={feedback.severity}
                    variant='filled'
                    sx={{ width: '100%' }}
                >{feedback.message}</Alert>
            </Snackbar>
            <form action={handleSubmit}>
                <FormGroup row>
                    <FormControl>
                        <TextField
                            label="Fix Version"
                            value={formData.fixVersion}
                            onChange={e => setFormData({ ...formData, fixVersion: e.target.value })}
                            required
                        />
                        <FormHelperText>Valid version formats: x.x.x or x.x</FormHelperText>
                    </FormControl>
                    <FormControl>
                        <TextField
                            label="Fix Version Link"
                            value={formData.fixVersionLink}
                            onChange={e => setFormData({ ...formData, fixVersionLink: e.target.value })}
                        />
                    </FormControl>
                    <FormControl required>
                        <InputLabel id="team-label">Team</InputLabel>
                        <Select
                            id="team-label"
                            label="Team"
                            name="team"
                            value={formData.team}
                            onChange={e => setFormData({ ...formData, team: e.target.value })}
                        >
                            <MenuItem value="cms1">CMS1</MenuItem>
                            <MenuItem value="cms2">CMS2</MenuItem>
                            <MenuItem value="cms3">CMS3</MenuItem>
                        </Select>
                    </FormControl>
                </FormGroup>
                <h4>Steps</h4>
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: 5 }}>
                    {
                        (Object.entries(formData.steps) as [keyof Release['steps'], ReleaseStep][]).map(([step, obj]) => {
                            const previousStepIndex = Object.keys(formData.steps).findIndex(s => s === step)
                            const previousStepKey = previousStepIndex !== -1 ? Object.keys(formData.steps)[previousStepIndex - 1] as keyof Release['steps'] : null
                            const previousStepObj = previousStepKey ? formData.steps[previousStepKey] : null
                            const check = stepChecks(step, formData)

                            return (
                                <Card
                                    variant='outlined'
                                    key={step}
                                    sx={{ marginX: 2, flexGrow: 1 }}
                                >
                                    <input type="hidden" name="steps[]" value={step} />
                                    <CardHeader title={
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Typography variant='h6'>{obj.label}</Typography>
                                            <Typography variant='subtitle2' sx={{ textTransform: 'capitalize' }}>
                                                {
                                                    check.ready
                                                        ? <Typography variant='body1' sx={{ color: 'success.main' }}>Ready</Typography>
                                                        : <Typography variant='body1' sx={{ color: 'error.main' }}>Not Ready</Typography>
                                                }
                                            </Typography>
                                        </div>
                                    } />
                                    <CardContent>
                                        <FormGroup row>
                                            <FormControl>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="Start Date"
                                                        disabled={obj.status === 'skipped'}
                                                        minDate={previousStepObj && previousStepObj.scheduledAt ? new AdapterDayjs().date(previousStepObj.scheduledAt) : undefined}
                                                        value={obj.scheduledAt ? new AdapterDayjs().date(obj.scheduledAt) : null}
                                                        onChange={date => setFormData({
                                                            ...formData,
                                                            steps: {
                                                                ...formData.steps,
                                                                [step]: {
                                                                    ...obj,
                                                                    scheduledAt: date ? date.toISOString() : ''
                                                                }
                                                            }
                                                        })}
                                                    />
                                                </LocalizationProvider>
                                            </FormControl>
                                        </FormGroup>
                                            <FormGroup row>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            disabled={obj.status === 'completed' || obj.scheduledAt.length !== 0}
                                                            onChange={e => setFormData({
                                                                ...formData,
                                                                steps: {
                                                                    ...formData.steps,
                                                                    [step]: {
                                                                        ...obj,
                                                                        status: e.target.checked ? 'skipped' : 'not-started'
                                                                    }
                                                                }
                                                            })}
                                                        />
                                                    }
                                                    label="Skip"
                                                    value={step}
                                                />
                                            </FormGroup>
                                    </CardContent>
                                </Card>
                            )
                        })
                    }
                </Box>
                <h4>Branches</h4>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '25px'
                }}>
                    <div className='tickets-container'>
                        <div>
                            <TextField
                                label="Ticket/Branch"
                                value={ticket}
                                size='small'
                                onChange={e => setTicket(e.target.value)}
                                sx={{
                                    width: '500px'
                                }}
                            />
                            <Button
                                variant='contained'
                                color="success"
                                disabled={ticket.length === 0}
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        tickets: [
                                            ...formData.tickets,
                                            ticket
                                        ]
                                    })
                                    setTicket('')
                                }}
                                sx={{
                                    marginLeft: '3px'
                                }}
                            >Add</Button>
                            <Button
                                variant='contained'
                                color="warning"
                                disabled={!formData.fixVersion || searchingBranches || runningAction}
                                onClick={getPrInfo}
                                sx={{
                                    marginLeft: '3px'
                                }}
                            >Link branches</Button>
                        </div>
                        <div className="tickets-list">
                            <Chip
                                label={`collab/${formData.team}/release/${formData.fixVersion}`}
                            />
                            {
                                formData.tickets.map((branch, i) => (
                                    <Chip
                                        key={i}
                                        label={branch}
                                        disabled={searchingBranches || runningAction}
                                        onDelete={() => setFormData({
                                            ...formData,
                                            tickets: formData.tickets.filter(ticket => ticket !== branch)
                                        })}
                                    />
                                ))
                            }
                        </div>
                    </div>
                </Box>
                <Box marginBottom={5}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Repository</TableCell>
                                    <TableCell>Branch</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Last Modified</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    searchingBranches && (
                                        <TableRow>
                                            <TableCell colSpan={4} align='center'>Loading...</TableCell>
                                        </TableRow>
                                    )
                                }
                                {
                                    formData.branches.map((branch, i) => {
                                        const canCreateReleaseBranch = !branch.merged && branch.base.ref.match(/^collab\/.*\/release\/.*/) === null && !branch.head.ref.match(/^collab\/.*\/release\/.*/)
                                        const canMerge = !branch.merged && !branch.base.ref.includes(branch.base.repo.default_branch)

                                        return (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <IconButton
                                                        title='Create release branch'
                                                        disabled={runningAction || !canCreateReleaseBranch}
                                                        onClick={() => createReleaseBranch(branch)}
                                                    >
                                                        <FontAwesomeIcon icon={faCodeBranch} size='xs' />
                                                    </IconButton>
                                                    <IconButton
                                                        title='Merge'
                                                        disabled={runningAction || !canMerge}
                                                        onClick={() => mergeBranch(branch)}
                                                    >
                                                        <FontAwesomeIcon icon={faCodeMerge} size='xs' />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    {branch.base.repo.name}
                                                    <IconButton
                                                        onClick={() => window.open(branch.html_url, '_blank')}
                                                    >
                                                        <Launch fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <div>{branch.base.ref}</div>
                                                                <div style={{ margin: '0 10px' }}>
                                                                    {
                                                                        branch.merged
                                                                            ? <FontAwesomeIcon icon={faCodeMerge} /> : branch.state !== 'closed'
                                                                                ? <FontAwesomeIcon icon={faCodePullRequest} /> : <FontAwesomeIcon icon={faX} />
                                                                    }
                                                                </div>
                                                                <div>{branch.head.ref}</div>
                                                            </div>
                                                        }
                                                        size="small"
                                                        color={branch.merged ? 'success' : branch.state === 'closed' ? 'error' : 'default'}
                                                        variant="filled"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        sx={{
                                                            color: branch.state && branch.merged ? 'success.main' : branch.state === 'closed' ? 'error.main' : 'white',
                                                            textTransform: 'capitalize'
                                                        }}
                                                    >{branch.state && branch.merged ? 'Merged' : branch.state}</Typography>
                                                </TableCell>
                                                <TableCell>{new AdapterDayjs().date(branch.updated_at).format('MM/DD/YYYY hh:mm A')}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <FormGroup row>
                    <Button
                        variant='outlined'
                        color="error"
                        onClick={() => navigate('/releases')}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="info"
                        sx={{ marginLeft: '10px' }}
                    >{id ? 'Update' : 'Create' }</Button>
                </FormGroup>
            </form>
        </Paper>
    )
}
