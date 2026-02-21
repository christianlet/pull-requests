import { useEffect, useState } from 'react'
import { AuthenticatedUser } from '../types/api-types'
import { getAuthenticatedUser } from '../utilities/git-api/users/get-authenticated-user'


export const useAuthenticatedUser = () => {
    const [user, setUser] = useState<null | AuthenticatedUser>(null)

    useEffect(() => {
        setUser(null)

        const getUser = async () => {
            try {
                const user = await getAuthenticatedUser()

                if (user) {
                    setUser(user)
                }
            } catch (e) { }
        }

        getUser()
    }, [])

    return user
}
