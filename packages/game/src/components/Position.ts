import type { ComponentState } from '../core/Component'
import type { INetworkIdentity } from '../core/NetworkIdentity'

import { v4 as uuid } from 'uuid'

import { NetworkComponent } from '../core/NetworkComponent'
import { NetworkIdentity } from '../core/NetworkIdentity'

export interface PositionState extends ComponentState {
  x: number
  y: number
}

export type PositionComponentCreateData = Omit<PositionState, 'isDisabled'> &
  Partial<Pick<PositionState, 'isDisabled'>>

export class PositionComponent
  extends NetworkComponent<PositionState>
  implements INetworkIdentity
{
  public static create(data: PositionComponentCreateData) {
    return new PositionComponent(uuid(), { isDisabled: false, ...data })
  }

  private readonly _networkId: NetworkIdentity

  get networkId() {
    return this._networkId.id
  }

  constructor(id: PositionComponent['id'], state: PositionState) {
    super({ id, name: 'Position' }, state)

    this._networkId = new NetworkIdentity(this, id)
  }
}
