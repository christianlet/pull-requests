import React from 'react'
import { Redirect, useLocation } from 'react-router';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const OauthCallback = () => {
    const query = useQuery()

    console.log(query.get('code'));

    return (
        <Redirect
            to={`/tickets/${query.get('code')}`}
            from="/"
        />
    )
}
