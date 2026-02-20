
import { ApiClient } from '../../../clients/ApiClient'
import { User } from '../../../types/api-types'

export const getUsers = async (params?: { q?: string; size?: number }) => {
    const client = ApiClient.getInstance()
    const response = await client.request<{ items: User[] }>('/github/users', {
        searchParams: params
    })
    const users = response.items.map(item => ({
        ...item,
        username: item.login,
        name: item.name || item.login
    }))

    return users
}