import { Octokit } from '@octokit/rest';

export interface AuthorizationConstructor {
    generate(): Promise<Octokit>
}