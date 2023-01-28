import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useHitpointsStore =
  createComponentStore<seawars.HitpointsComponent>('Hitpoints')
