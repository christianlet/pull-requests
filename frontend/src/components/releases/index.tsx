import { AddTask, Edit, Launch } from '@mui/icons-material'
import { Box, Button, Card, CardHeader, Chip, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CollectionsClient } from '../../clients/collections-client'
import { Release } from '../../types/releases/release'
import { getTeam } from '../../utilities/teams'

export const Releases = () => {
    const [releases, setReleases] = useState<Release[]>([])

    useEffect(() => {
        const releaseStorage = new CollectionsClient<Release>('releases')

        releaseStorage.getAll().then(r => {
            setReleases(r.items)
        }).catch(e => console.log(e))
    }, [])

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
                                                <Chip
                                                    label={release.team.toUpperCase()}
                                                    sx={{
                                                        marginRight: 1,
                                                        backgroundColor: getTeam(release.team)?.color ?? 'gray',
                                                        color: 'black'
                                                    }}
                                                />
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
