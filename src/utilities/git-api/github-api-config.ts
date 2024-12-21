export const githubApiConfig = {
    type: import.meta.env.VITE_AUTH_TYPE,
    accessToken: import.meta.env.VITE_PAT ?? null,
    id: import.meta.env.VITE_CLIENT_ID ?? null,
    secret: import.meta.env.VITE_CLIENT_SECRET ?? null,
}
