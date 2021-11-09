import { Octokit } from '@octokit/rest';

export interface AuthorizationConstructor {
    generate(): Octokit
}