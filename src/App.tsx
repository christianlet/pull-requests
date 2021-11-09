import React, { useEffect, useState } from 'react';
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { Tickets } from './tickets';
import { OauthCallback } from './oauth-callback';
import { AppBar, CssBaseline, FormControlLabel, FormGroup, Paper, Toolbar, Typography, useMediaQuery } from '@mui/material';
import InputBase from '@mui/material/InputBase'
import { default as MuiSwitch } from '@mui/material/Switch'
import { RateLimit } from './rate-limit';
import { useAppDispatch } from './hooks/redux-hooks';
import { alpha, styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useAuthenticatedUser } from './hooks/authenticated-user';
import { userSlice } from './redux/reducers/user-reducer';
import { Box } from '@mui/system';
import { Password } from '@mui/icons-material';
import { tokenSlice } from './redux/reducers/token-reducer';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '40ch'
      },
    },
  }));

function App() {
    const [darkMode, setDarkMode] = useState(false)
    const [patToken, setPatToken] = useState('')
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

    useEffect(() => {
        dispatch(tokenSlice.actions.set(patToken ?? null))
    }, [patToken])

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
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
                        {
                            !process.env.REACT_APP_PAT && (
                                <Search>
                                    <SearchIconWrapper>
                                        <Password />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        placeholder="Personal Access Token..."
                                        inputProps={{ 'aria-label': 'search' }}
                                        onChange={e => setPatToken(e.target.value)}
                                    />
                                </Search>
                            )
                        }
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
                <Switch>
                    <Route
                        path="/"
                        exact={true}
                    >
                        <Paper square sx={{
                            position: 'absolute',
                            top: 48,
                            left: 0,
                            right: 0,
                            bottom: 48,
                            overflow: 'auto'
                        }}>
                            <Tickets />
                        </Paper>
                    </Route>
                    <Route path="/branches">
                    </Route>
                    <Route path="/oauth-callback">
                        <OauthCallback />
                    </Route>
                </Switch>
                <AppBar
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
                </AppBar>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
