/* eslint-disable react-hooks/exhaustive-deps */
import { Alert, AlertProps, Button, FormControl, FormGroup, FormHelperText, InputLabel, MenuItem, Paper, Select, Snackbar, TextField } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { Release } from '../../../types/releases/release'
import './styles.scss'
import { Api } from '../../../utilities/git-api/storage/api'
import { useEffect, useState } from 'react'

interface FeedbackState {
    severity: AlertProps['severity']
    message: string
}

export const Edit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [feedback, setFeedback] = useState<FeedbackState>({
        severity: 'info',
        message: ''
    })
    const [formData, setFormData] = useState<Release>({
        id: '',
        team: '',
        url: '',
        version: ''
    })

    const handleSubmit = async () => {
        const releaseStorage = new Api<Release>('releases')
        const releaseId = `${formData.team}-${formData.version}`

        await releaseStorage[id ? 'update' : 'create'](releaseId, {
            ...formData,
            id: releaseId
        })

        setFeedback({
            severity: 'success',
            message: 'Release saved successfully'
        })

        navigate('/releases')
    }

    useEffect(() => {
        if(id) {
            const releaseStorage = new Api<Release>('releases')

            releaseStorage.get(id).then((release) => {
                console.log(release);

                if(release) {
                    setFormData(release)
                }
            }).catch(e => console.log(e))
        }
    }, [id])

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