import { AddTask, Edit, PlayArrow, PlusOne } from '@mui/icons-material'
import { Box, Button, Card, CardContent, CardHeader, Divider, IconButton, Typography } from '@mui/material'
import { Link, NavLink } from 'react-router-dom'
import { SessionStorage } from '../../utilities/git-api/local-storage/session-storage'
import { Release } from '../../types/releases/release'
import { Step } from './step'

export const Releases = () => {
    const releaseStorage = new SessionStorage<Release>('releases')
    const releases = Object.values(releaseStorage.getAll())

    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '50px',
                bgcolor: 'background.paper',
                padding: 1
            }}>
                <Button
                    component={NavLink}
                    to="edit"
                    variant='contained'
                    color='secondary'
                    startIcon={<AddTask />}
                >
                    Create Release
                </Button>
            </Box>
            <Box marginTop={5} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: '50px',
            }}>
                {
                    releases.map(release => (
                        <Card
                            key={release.fixVersion}
                            elevation={5}
                            sx={{
                                width: '500px'
                            }}
                        >
                            <CardHeader
                                title={
                                    <Box display="flex" justifyContent="space-between" alignContent="center">
                                        <div>
                                            <Typography variant="h5">
                                                {release.fixVersion}
                                            </Typography>
                                        </div>
                                        <IconButton
                                            component={Link}
                                            to={`edit/${release.fixVersion}`}
                                            size='small'
                                        >
                                            <Edit />
                                        </IconButton>
                                    </Box>
                                }
                            />
                            <CardContent sx={{ padding: 0, margin: 0, paddingBottom: '0 !important' }}>
                                {
                                    Object.entries(release.steps).map(([step, obj], index) => (
                                        <Step
                                            key={step}
                                            {...release}
                                            step={step as keyof Release['steps']}
                                        />
                                    ))
                                }
                            </CardContent>
                        </Card>
                    ))
                }
            </Box>
        </>
    )
}
