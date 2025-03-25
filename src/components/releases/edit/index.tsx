/* eslint-disable react-hooks/exhaustive-deps */
import { Alert, AlertProps, Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, FormControl, FormControlLabel, FormGroup, FormHelperText, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useNavigate, useParams } from 'react-router-dom'
import { Release } from '../../../types/releases/release'
import './styles.scss'
import { SessionStorage } from '../../../utilities/git-api/local-storage/session-storage'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch, faCodeMerge, faCodePullRequest, faX } from '@fortawesome/free-solid-svg-icons'
import { getPullRequests } from '../../../utilities/git-api/pulls/get-pull-requests'
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
        team: '',
        url: '',
        version: ''
    })

    const handleSubmit = async () => {
        const releaseId = `${formData.team}-${formData.version}`

        releaseStorage.store(releaseId, formData)

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
                <FormGroup style={{
                    marginBottom: 25
                }}>
                    <FormControl>
                        <TextField
                            label="Fix Version"
                            value={formData.version}
                            onChange={e => setFormData({ ...formData, version: e.target.value })}
                            required
                        />
                        <FormHelperText>Valid version formats: x.x.x or x.x</FormHelperText>
                    </FormControl>
                    <FormControl>
                        <TextField
                            label="Fix Version Link"
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            required
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
                            required
                        >
                            <MenuItem value="cms1">CMS1</MenuItem>
                            <MenuItem value="cms2">CMS2</MenuItem>
                            <MenuItem value="cms3">CMS3</MenuItem>
                        </Select>
                    </FormControl>
                </FormGroup>
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