import { Router } from 'express'
import { create } from './create'
import { find } from './find'
import { remove } from './remove'
import { search } from './search'
import { update } from './update'

export const teamsRouter = Router()

teamsRouter.post('/', create)
teamsRouter.get('/', search)
teamsRouter.get('/:id', find)
teamsRouter.put('/:id', update)
teamsRouter.delete('/:id', remove)