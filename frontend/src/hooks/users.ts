import { useEffect, useState } from 'react'
import { getUsers } from '../utilities/git-api/users/get-users'

interface User {
    username: string
    name: string
}

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        setUsers([])

        const getUser = async () => {
            try {
                const users = await getUsers()

                if(users) {
                    setUsers(users)
                }
            } catch(e){}
        }

        getUser()
    }, [])

    return users
}
