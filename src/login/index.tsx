import React from 'react'
import { Button } from '@mui/material'

export const Login = () => {
    return (
        <Button
            color="primary"
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
    )
}
