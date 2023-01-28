import type { ComponentState } from '../core/Component'

import { v4 as uuid } from 'uuid'

import { GameError } from '../core/GameError'
import { NetworkComponent } from '../core/NetworkComponent'
import { ItemState } from './Item'

export interface InventoryState extends ComponentState {
  items: ItemState[]
  slots: number
}

export class InventoryComponent extends NetworkComponent<any> {
  public static create(data?: Partial<InventoryState>) {
    return new InventoryComponent(uuid(), {
      isDisabled: false,
      items: [],
      slots: 1,
      ...data
    })
  }

  constructor(id: InventoryComponent['id'], state: InventoryState) {
    super({ id, name: 'Inventory' }, state)
  }

  public addItem(item: ItemState): void {
    const { items, slots } = this.getState()

    if (items.length === slots) {
      throw new GameError(`InventoryComponent: Cannot store item. The inventory is full.`)
    }

    this.store.setState((currentState: InventoryState) => ({
      ...currentState,
      items: [...currentState.items, item]
    }))
  }
}
