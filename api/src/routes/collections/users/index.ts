import { Router } from 'express'
import { create } from './create'
import { find } from './find'
import { remove } from './remove'
import { search } from './search'
import { update } from './update'

export const usersRouter = Router()

usersRouter.post('/', create)
usersRouter.get('/', search)
usersRouter.get('/:id', find)
usersRouter.put('/:id', update)
usersRouter.delete('/:id', remove)