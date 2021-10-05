import React from 'react';
import { Switch, Route, BrowserRouter, Link } from "react-router-dom";
import { Tickets } from './tickets';
import { OauthCallback } from './oauth-callback';
import { AppBar, CssBaseline, Drawer, List, ListItemButton, ListItemIcon, MenuItem, Paper, Toolbar, Typography } from '@mui/material';
import { RateLimit } from './rate-limit';
import { faCodeBranch, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() {
  return (
    <BrowserRouter>
        <CssBaseline />
        <Drawer
            variant="permanent"
            anchor="left"
        >
            <List>
                <MenuItem
                    component={Link}
                    to="/"
                    divider={true}
                    sx={{
                        display: 'block',
                        textAlign: 'center'
                    }}
                >
                    <ListItemIcon sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faUserFriends} size="lg" />
                    </ListItemIcon>
                    <Typography
                        display="block"
                        fontSize={11}
                        textAlign="center"
                        color="GrayText"
                    >PRs</Typography>
                </MenuItem>
                <MenuItem
                    component={Link}
                    to="/branches"
                    sx={{
                        display: 'block',
                        textAlign: 'center'
                    }}
                >
                    <ListItemIcon sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faCodeBranch} size="lg" />
                    </ListItemIcon>
                    <Typography
                        display="block"
                        fontSize={11}
                        textAlign="center"
                        color="GrayText"
                    >Branches</Typography>
                </MenuItem>
            </List>
        </Drawer>
        <Paper square sx={{
            position: 'absolute',
            top: 0,
            left: '80px',
            right: 0,
            bottom: 0,
            overflow: 'auto'
        }}>
            <Switch>
                <Route
                    path="/"
                    exact={true}
                >
                    <Paper square sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: '48px',
                        overflow: 'auto'
                    }}>
                        <Tickets />
                    </Paper>
                    <>
                        <AppBar position="absolute"  sx={{ top: 'auto', bottom: 0, backgroundColor: 'rgba(0,0,0,.9)' }}>
                            <Toolbar variant="dense">
                                <RateLimit />
                            </Toolbar>
                        </AppBar>
                    </>
                </Route>
                <Route path="/branches">
                </Route>
                <Route path="/oauth-callback">
                    <OauthCallback />
                </Route>
            </Switch>
        </Paper>
    </BrowserRouter>
  );
}

export default App;
