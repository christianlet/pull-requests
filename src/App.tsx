import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAppDispatch } from './hooks/redux-hooks';
import { useAuthenticatedUser } from './hooks/authenticated-user';
import { userSlice } from './redux/reducers/user-reducer';
import { OctokitClient } from './utilities/octokit-client'
import { default as MuiSwitch } from '@mui/material/Switch'
import { ThemeProvider } from '@emotion/react'
import { AppBar, Box, createTheme, CssBaseline, FormControlLabel, FormGroup, Paper, Toolbar, Typography, useMediaQuery } from '@mui/material'
import { PullRequestDescription } from './components/action/pull-request-description'
import { OauthCallback } from './components/oauth-callback'
import { Tickets } from './tickets'
import { BranchDetail } from './components/branch-detail'

function App() {
    const user = useAuthenticatedUser()
    const dispatch = useAppDispatch()
    const [octokitConnecting, setOctokitConnecting] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const theme = useMemo(() =>
        createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light'
            }
        })
    , [darkMode])

    useEffect(() => {
        setDarkMode(prefersDarkMode)
    }, [prefersDarkMode])

    useEffect(() => {
        if(user) {
            dispatch(userSlice.actions.set(user))

            setOctokitConnecting(true)

            OctokitClient.getInstance().then(octokit => {
                setOctokitConnecting(false)
            })
        }
    }, [user, dispatch])

    if(octokitConnecting) {
        return <div>Connecting...</div>
    }

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                <Routes>
                    <Route path="/">
                        <Route
                            path="prs"
                        >
                            <Route
                                index
                                element={<TicketsPage />}
                            />
                            <Route
                                path="*"
                                element={<BranchDetail />}
                            />
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

const TicketsPage = () => (
    <Paper square sx={{
        overflow: 'auto'
    }}>
        <Tickets />
    </Paper>
)

const Header = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (c: boolean) => void }) => (
    <AppBar
        color="primary"
        enableColorOnDark={true}
        position="sticky"
        sx={{
            bgcolor: 'primary.dark',
            color: 'white'
        }}
    >
        <Toolbar
            variant="dense"
        >
            <GitHubIcon sx={{ marginRight: 1 }} />
            <Typography sx={{ flexGrow: 1 }}>
                GitHub Manager
            </Typography>
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
)

export default App;
