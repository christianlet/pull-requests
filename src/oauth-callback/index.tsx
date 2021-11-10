import React, { useEffect } from 'react'
import { Redirect, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { tokenSlice } from '../redux/reducers/token-reducer';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const OauthCallback = () => {
    const query = useQuery()
    const dispatch = useAppDispatch()
    const code = query.get('code')
    const token = useAppSelector(state => state.token.value)

    useEffect(() => {
        dispatch(tokenSlice.actions.set(code))
    }, [code, dispatch])

    return (
        <>
        {
            token && (
                <Redirect
                    to={`/search`}
                    from="/"
                />
            )
        }
        </>
    )
}
