import React from 'react'
import { MenuItem, Select } from '@mui/material'
import { useAuthorsHook } from '../hooks/authors-hook'

interface AuthorsSelectProps {
    value: string
    onChange: (a: any) => void
    disabled: boolean
}

export const AuthorsSelect = (props: AuthorsSelectProps) => {
    const teamMembers = useAuthorsHook()

    return (
        <Select
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled || teamMembers === null}
            size="small"
            renderValue={data => {
                if(data === '') {
                    return "All"
                }

                return teamMembers?.filter(m => m.username === data).pop()?.name
            }}
            displayEmpty={true}
            MenuProps={{
                style: {
                    maxHeight: 300
                }
            }}
        >
            <MenuItem key="all" value="" divider={true}>
                All
            </MenuItem>
            {
                teamMembers && teamMembers.map((user, index) => (
                    <MenuItem key={user.username} value={user.username} divider={true}>
                        {user.name}
                    </MenuItem>
                ))
            }
        </Select>
    )
}
