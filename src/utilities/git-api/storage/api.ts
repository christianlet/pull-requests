import { join } from 'path'


export class Api<Type extends Record<string, unknown> = Record<string, unknown>> {
    private url: string

    public constructor(
        storageName: string
    ) {
        this.url = import.meta.env.VITE_API_URL + '/' + storageName
    }

    public async create(key: string|number, data: Type): Promise<void> {
        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        console.log(await response.json())
    }

    public async update(key: string|number, data: Type): Promise<void> {
        const response = await fetch(this.url + '/' + key, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        console.log(await response.json())
    }

    public async get(key: string|number): Promise<Type | null> {
        const response = await fetch(this.url + '/' + key.toString(), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        return json.item
    }

    public async getAll(): Promise<{ items: Type[] }> {
        const response = await fetch(`${this.url}?size=50&page=1`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return response.json()
    }

    public async delete(key: string|number): Promise<void> {
        const response = await fetch(this.url + '/' + key.toString(), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log(await response.json())
    }
}
