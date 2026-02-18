
interface ApiRequestInit extends RequestInit {
    searchParams?: Record<string, unknown>
}

export class ApiClient {
    private static instance: ApiClient

    public static getInstance(): ApiClient {
        if (!this.instance) {
            this.instance = new ApiClient()
        }

        return this.instance
    }

    private baseUrl: string
    private requiredHeaders: HeadersInit

    private constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL
        this.requiredHeaders = {
            'Content-Type': 'application/json',
            'token': import.meta.env.VITE_PAT
        }
    }

    public async request<Type>(endpoint: string, requestInit?: ApiRequestInit): Promise<Type> {
        const url = new URL(this.baseUrl)

        url.pathname = endpoint

        if (requestInit?.searchParams) {
            for (let [key, value] of Object.entries(requestInit.searchParams)) {
                if (typeof value === 'number') {
                    value = value.toString()
                }

                if (typeof value !== 'string') {
                    continue
                }

                url.searchParams.set(key, value)
            }
        }

        const response = await fetch(url, {
            ...requestInit,
            headers: {
                ...requestInit?.headers,
                ...this.requiredHeaders
            }
        })

        return response.json()
    }
}
