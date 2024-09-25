import React, { useEffect, useState } from 'react';
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { Tickets } from './tickets';
import { OauthCallback } from './oauth-callback';
import { AppBar, CssBaseline, FormControlLabel, FormGroup, Paper, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { default as MuiSwitch } from '@mui/material/Switch'
import { useAppDispatch } from './hooks/redux-hooks';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useAuthenticatedUser } from './hooks/authenticated-user';
import { userSlice } from './redux/reducers/user-reducer';
import { Box } from '@mui/system';
import { GhaAuthentication } from './gha-authentication';

function App() {
    const [darkMode, setDarkMode] = useState(false)
    const user = useAuthenticatedUser()
    const dispatch = useAppDispatch()
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const theme = React.useMemo(() =>
        createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light'
            }
        })
    , [darkMode])

    useEffect(() => {
        if(user) {
            dispatch(userSlice.actions.set(user))
        }
    }, [user, dispatch])

    useEffect(() => {
        setDarkMode(prefersDarkMode)
    }, [prefersDarkMode])

    console.log(dispatch);
    

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Switch>
                    <Route
                        path="/"
                        exact={true}
                    >
                        <GhaAuthentication />
                    </Route>
                    <Route
                        path="/search"
                        exact={true}
                    >
                        <AppBar
                            color="primary"
                            enableColorOnDark={true}
                            sx={{
                                bgcolor: 'primary.dark',
                                color: 'white'
                            }}
                        >
                            <Toolbar
                                variant="dense"
                            >
                                <Typography sx={{ flexGrow: 1 }}>
                                    Peer Reviews
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
                        <Paper square sx={{
                            position: 'absolute',
                            top: 48,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflow: 'auto'
                        }}>
                            <Tickets />
                        </Paper>
                        {/* <AppBar
                            position="absolute"
                            sx={{
                                top: 'auto',
                                bottom: 0,
                                bgcolor: 'background.paper' ,
                                borderTop: 'solid thin',
                                borderTopColor: 'divider'
                            }}
                        >
                            <Toolbar variant="dense">
                                <RateLimit />
                            </Toolbar>
                        </AppBar> */}
                    </Route>
                    <Route path="/oauth-callback">
                        <OauthCallback />
                    </Route>
                </Switch>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
