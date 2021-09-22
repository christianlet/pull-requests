import React from 'react';
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { Tickets } from './tickets';
import { OauthCallback } from './oauth-callback';
import { AppBar, Chip, CssBaseline, Paper, Toolbar } from '@mui/material';
import { RateLimit } from './rate-limit';

function App() {
  return (
    <BrowserRouter>
        <CssBaseline />
        <Switch>
            <Route
                path="/"
            >
                <Paper square sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: '64px',
                    overflow: 'auto'
                }}>
                    <Tickets />
                </Paper>
                <>
                    <AppBar position="fixed"  sx={{ top: 'auto', bottom: 0, backgroundColor: 'rgba(0,0,0,.9)' }}>
                        <Toolbar>
                            <RateLimit />
                            <div>
                                <Chip

                                />
                            </div>
                        </Toolbar>
                    </AppBar>
                </>
            </Route>
            <Route path="/oauth-callback">
                <OauthCallback />
            </Route>
        </Switch>
    </BrowserRouter>
  );
}

export default App;
