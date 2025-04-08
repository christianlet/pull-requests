# Pull Requests

## Getting started

Duplicate the `.env.local.sample` file with the name `.env.local`

Add your PAT token to the config key `VITE_PAT`

Run `npm start` to start up the application

## Pull Requests

The app groups pull requests by branch name. Links to each PR in github is available. If the branch name follows the Fox naming conventions a link to the Jira ticket will be provided. The app also allows you to see teammates pull requests. Viewing other users can simply be done by using the dropdown on the upper left side.

The information display in the pull requests:
- When the PR was created
- The branch it is targeting
- The peer reviews it receives. Shows:
  - Approvals
  - Changes requested
  - Number of comments

## Actions

When you are viewing pull requests you have created, you have access to actions that can be run.

### Update Target Branch

Allows you to set all grouped pull requests target branch.

### Copy For Jira Comment

Copies the grouped pull requests to your local clipboard to be pasted to a Jira comment.

### Merge Pull Requests

Merges pull requests into the specified target branch. Only allows merge if the pull request satisfies all the repo specifications.
