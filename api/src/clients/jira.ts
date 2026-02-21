

export class Jira {
    private static instance: Jira

    public static getInstance(token: string): Jira {
        if (!this.instance) {
            this.instance = new Jira(token)
        }

        return this.instance
    }

    private baseUrl: string
    private apiToken: string

    private constructor(token: string) {
        this.baseUrl = 'https://teamfox.atlassian.net'
        this.apiToken = token
    }

    public async getIssue(issue: string): Promise<unknown> {
        const result = await fetch(
            `${this.baseUrl}/rest/api/3/issue/${issue}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.apiToken
                }
            }
        )

        return result.json()
    }

    public async searchIssues(issues: string[]): Promise<unknown> {
        const result = await fetch(
            `${this.baseUrl}/rest/api/3/issue/bulkfetch`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.apiToken
                },
                body: JSON.stringify({
                    fields: [
                        'statusCategory'
                    ],
                    issueIdsOrKeys: issues
                }),
                method: 'POST'
            }
        )

        return result.json()
    }

}
