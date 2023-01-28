import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useGunAttackStore =
  createComponentStore<seawars.GunAttackComponent>('GunAttack')
