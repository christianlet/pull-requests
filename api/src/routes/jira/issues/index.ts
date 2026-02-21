import { Router } from 'express'
import { find } from './find'
import { search } from './search'

export const jiraIssueRouter = Router()

jiraIssueRouter.get('/:issueId', find)
jiraIssueRouter.post('/search', search)