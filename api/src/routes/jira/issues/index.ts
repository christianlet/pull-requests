import { Router } from 'express'
import { find } from './find'
import { search } from './search'
import { searchTransitions } from './searchTransitions'

export const jiraIssueRouter = Router()

jiraIssueRouter.get('/:issueId', find)
jiraIssueRouter.get('/:issueId/transitions', searchTransitions)
jiraIssueRouter.post('/search', search)