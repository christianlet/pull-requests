import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app';
import { Octokit } from '@octokit/rest'
import { Authorization } from './auth';

export class Oauth implements Authorization {
    protected code: string
    protected id: string
    protected secret: string

    constructor(code: string) {
        this.code = code

        if(process.env.REACT_APP_CLIENT_ID && process.env.REACT_APP_CLIENT_SECRET) {
            this.id   = process.env.REACT_APP_CLIENT_ID
            this.secret = process.env.REACT_APP_CLIENT_SECRET
        } else {
            throw new Error("App credentials not set");
        }
    }

    public async generate() {
        const appOctokit = new Octokit({
            authStrategy: createOAuthAppAuth,
            auth: {
                clientId: this.id,
                clientSecret: this.secret
            }
        })

        return await appOctokit.auth({
            type: 'oauth-user',
            code: this.code,
            factory: (options: any) => {
                return new Octokit({
                    authStrategy: createOAuthUserAuth,
                    auth: options
                })
            }
        }) as Octokit
    }
}
