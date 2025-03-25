import { AddTask, Edit, Launch } from '@mui/icons-material'
import { Box, Button, Card, CardHeader, IconButton, Typography } from '@mui/material'
import { Link, NavLink } from 'react-router-dom'
import { SessionStorage } from '../../utilities/git-api/local-storage/session-storage'
import { Release } from '../../types/releases/release'

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
                {
                    <Button
                        component={NavLink}
                        to="edit"
                        variant='contained'
                        color='secondary'
                        startIcon={<AddTask />}
                    >
                        Create Release
                    </Button>
                }
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
                            key={release.version}
                            elevation={5}
                            sx={{
                                width: '500px'
                            }}
                        >
                            <CardHeader
                                title={
                                    <Box display="flex" justifyContent="space-between" alignContent="center">
                                        <div>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <Typography variant="h5">
                                                    {release.version}
                                                </Typography>
                                                <IconButton
                                                    onClick={() =>
                                                        window.open(
                                                            release.url,
                                                            '_blank'
                                                        )
                                                    }
                                                    size="small"
                                                    sx={{
                                                        color: 'text.primary'
                                                    }}
                                                >
                                                    <Launch fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </div>
                                        {
                                            <IconButton
                                                component={Link}
                                                to={`edit/${release.team}-${release.version}`}
                                                size='small'
                                            >
                                                <Edit />
                                            </IconButton>
                                        }
                                    </Box>
                                }
                            />
                        </Card>
                    ))
                }
            </Box>
        </>
    )
}
