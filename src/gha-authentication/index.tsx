import React from 'react'
import { Button, Container } from '@mui/material'
import { Box } from '@mui/system'
import { GitHub } from '@mui/icons-material'
import { Redirect } from 'react-router'

export const GhaAuthentication = () => {
    return (
        <>
            {
                process.env?.REACT_APP_AUTH_TYPE === 'pat' && (
                    <Redirect
                        to={`/search`}
                        from="/"
                    />
                )
            }
            {
                process.env?.REACT_APP_AUTH_TYPE === 'oauth' && (
                    <Container
                        maxWidth="sm"
                    >
                        <Box
                            marginTop={8}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                        >
                            <GitHub
                                sx={{
                                    fontSize: "25vh",
                                    marginBottom: 5
                                }}
                            />
                            <Button
                                color="info"
                                fullWidth={true}
                                variant="contained"
                                onClick={() => {
                                    const params: {
                                        [index: string]: any
                                    } = {
                                        client_id: process.env.REACT_APP_CLIENT_ID,
                                        redirect_uri: 'http://localhost:3000/oauth-callback',
                                        scope: 'repo'
                                    }
                                    window.open(
                                        'http://github.com/login/oauth/authorize?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&'),
                                        '_self'
                                    )
                                }}
                            >
                                Login with GitHub
                            </Button>
                        </Box>
                    </Container>
                )
            }
        </>
    )
}
