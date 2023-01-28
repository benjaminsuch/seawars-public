import type { ComponentState } from '../core/Component'
import type { AttackConfig } from './GunAttack'

import { v4 as uuid } from 'uuid'

import { NetworkComponent } from '../core/NetworkComponent'

export interface ShipGunState extends ComponentState {
  damage: number
  // Range: -1.5 to 1.5
  angle: number
  // Range: 0.15 to 0.45
  tilt: number
  variant: string
}

export class ShipGunComponent extends NetworkComponent<ShipGunState> {
  static create(data?: Partial<ShipGunState>) {
    return new ShipGunComponent(uuid(), {
      damage: 2,
      angle: 0,
      tilt: 0.15,
      variant: 'cannon01',
      isDisabled: false,
      ...data
    })
  }

  constructor(id: ShipGunComponent['id'], state: ShipGunState) {
    super({ id, name: 'ShipGun' }, state)
  }

  //TODO: Check for buffs, debuffs and other effects that could change the config.
  getConfig(): AttackConfig {
    return { damage: 2 }
  }
}
