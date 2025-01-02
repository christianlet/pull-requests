import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, NavLink, Outlet, Route, Routes } from "react-router-dom";
import GitHubIcon from '@mui/icons-material/GitHub';
import { default as MuiSwitch } from '@mui/material/Switch'
import { ThemeProvider } from '@emotion/react'
import { AppBar, Box, Button, createTheme, CssBaseline, FormControlLabel, FormGroup, Paper, Toolbar, Typography, useMediaQuery } from '@mui/material'
import { OauthCallback } from './components/oauth-callback'
import { Tickets } from './tickets'
import { BranchDetail } from './components/branch-detail'
import { Releases } from './components/releases'
import { Edit } from './components/releases/edit'

function App() {
    const [darkMode, setDarkMode] = useState(true)
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light'
            }
        })
    }, [darkMode])

    useEffect(() => {
        setDarkMode(prefersDarkMode)
    }, [prefersDarkMode])

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Routes>
                    <Route path="/" element={<Header darkMode={darkMode} setDarkMode={setDarkMode} />}>
                        <Route
                            path="prs"
                        >
                            <Route
                                index
                                element={<Tickets />}
                            />
                            <Route
                                path="*"
                                element={<BranchDetail />}
                            />
                        </Route>
                        <Route
                            path="releases"
                        >
                            <Route index element={<Releases />} />
                            <Route path="edit/:id?" element={<Edit />} />
                        </Route>
                        <Route
                            path="oauth-callback"
                            element={<OauthCallback />}
                        />
                        <Route
                            path="octokit-error"
                            element={<div>Octokit error</div>}
                        />
                    </Route>
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    );
}

const Header = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (c: boolean) => void }) => {
    return (
        <Box>
            <AppBar
                color="primary"
                enableColorOnDark={true}
                position="sticky"
                sx={{
                    bgcolor: 'primary.dark',
                    color: 'white',
                    overflow: 'hidden',
                }}
            >
                <Toolbar
                    variant="dense"
                    disableGutters={true}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingX: 1
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            disableRipple={true}
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.dark',
                                display: 'flex',
                                textTransform: 'capitalize'
                            }}
                        >
                            <GitHubIcon sx={{ marginRight: 1 }} />
                            <Typography sx={{ flexGrow: 1 }}>
                                GitHub Manager
                            </Typography>
                        </Button>
                        <Box marginLeft={1}>
                            <Button
                                component={NavLink}
                                to="prs"
                                color="inherit"
                                sx={{ marginRight: 1, textTransform: 'capitalize' }}
                            >
                                Pull Requests
                            </Button>
                            <Button
                                component={NavLink}
                                to="releases"
                                color="inherit"
                                sx={{
                                    marginRight: 1,
                                    textTransform: 'capitalize'
                                }}
                            >
                                Releases
                            </Button>
                        </Box>
                    </Box>
                    <Box>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <MuiSwitch
                                        color="default"
                                        checked={darkMode}
                                        onChange={e => {
                                            setDarkMode(e.target.checked ?? false)
                                        }}
                                    />
                                }
                                label="Dark Mode"
                                labelPlacement="start"
                            />
                        </FormGroup>
                    </Box>
                </Toolbar>
            </AppBar>
            <Paper
                sx={{
                    position: 'absolute',
                    top: 50,
                    bottom: 0,
                    width: '100%',
                    margin: 0,
                    padding: '25px 50px',
                    overflow: 'auto'
                }}
            >
                <Outlet />
            </Paper>
        </Box>
    )
}

export default App;
