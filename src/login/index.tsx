import React from 'react'
import { Button, Container, Paper } from '@mui/material'
import { Box } from '@mui/system'

export const Login = () => {
    return (
        <Container
            maxWidth="sm"
        >
            <Box marginTop={8}>
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
