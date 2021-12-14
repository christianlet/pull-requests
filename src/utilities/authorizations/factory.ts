import { Octokit } from '@octokit/rest';
import { Authorization } from './auth';
import { AuthorizationConstructor } from './auth-constructor';
import { Oauth } from './oauth';
import { PersonalAccessToken } from './personal-access-token';

export class Factory {
    protected authMap: Map<string, any>

    constructor(){
        this.authMap = this.setMap()
    }

    public async generate(): Promise<Octokit> {
        if(!process.env.REACT_APP_AUTH_TYPE) {
            throw new Error("ENV: REACT_APP_AUTH_TYPE not set");
        }

        const type = this.getAuthType(process.env.REACT_APP_AUTH_TYPE)
        const authObject = this.create(type)

        return await authObject.generate()
    }

    protected setMap(): Map<string, any> {
        return new Map<string, any>([
            ['oauth', Oauth],
            ['pat', PersonalAccessToken]
        ])
    }

    protected getAuthType(context: string): AuthorizationConstructor {
        if(!this.authMap.has(context)) {
            throw new Error(`Auth: ${context} behavior not defined`)
        }

        return this.authMap.get(context)
    }

    protected create(
        ctor: AuthorizationConstructor
      ): Authorization {
        return new ctor()
      }
}