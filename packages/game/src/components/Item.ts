import type { ComponentState } from '../core/Component'
import type { EventDispatcherEvent } from '../core/EventDispatcher'
import type { GameObject } from '../core/GameObject'

import { v4 as uuid } from 'uuid'

import { Component } from '../core/Component'

export type ItemName =
  | 'airstrike01'
  | 'cannon09'
  | 'emp01'
  | 'machine01'
  | 'machine02'
  | 'mine01'
  | 'railgun05'
  | 'railgun08'
  | 'reinforcements01'
  | 'shell01'
  | 'torpedo01'

export interface ItemState extends ComponentState {
  description?: string
  label: string
  name: ItemName
  stats: Record<string, unknown>
  type?: 'upgrade' | 'item'
}

export type ItemComponentCreateData = Omit<ItemState, 'isDisabled'> &
  Partial<Pick<ItemState, 'isDisabled'>>

export class ItemComponent extends Component<ItemState> {
  public static create(data: ItemComponentCreateData) {
    return new ItemComponent(uuid(), {
      isDisabled: false,
      type: 'item',
      ...data
    })
  }

  constructor(id: ItemComponent['id'], state: ItemState) {
    super({ id, name: 'Item' }, state)
  }
}
