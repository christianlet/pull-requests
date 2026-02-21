

import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import React from 'react'
import { GitHubClient } from '../../../clients/github-client'
import { User } from '../../../types/api-types'

interface Props {
    handleSelectChange: (user: null | User[]) => void
    authUser: User
    disabled?: boolean
}

export const AuthorDropdown = (props: Props) => {
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<readonly User[]>([])
    const [loading, setLoading] = React.useState(false)

    const handleOpen = () => {
        setOpen(true)

        if (!options.length) {
            ;(async () => {
                setLoading(true)

                const client = GitHubClient.getInstance()
                const users = await client.getUsers()

                setLoading(false)

                setOptions([...users])
            })()
        }
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Autocomplete
            sx={{ width: 300 }}
            size='small'
            multiple={true}
            limitTags={1}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            disabled={props.disabled}
            defaultValue={[props.authUser]}
            isOptionEqualToValue={(option, value) => option.login === value.login}
            getOptionLabel={(option) => option.name || option.login}
            onChange={(_, value) => props.handleSelectChange(value)}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Author"
                    slotProps={{
                        input: {
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                        },
                    }}
                />
            )}
        />
    )
}
