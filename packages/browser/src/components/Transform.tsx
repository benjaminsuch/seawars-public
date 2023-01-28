import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useTransformStore =
  createComponentStore<seawars.TransformComponent>('Transform')
