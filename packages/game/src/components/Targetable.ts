import type { ComponentState } from '../core/Component'
import type { EventDispatcherEvent } from '../core/EventDispatcher'

import { v4 as uuid } from 'uuid'

import { Component } from '../core/Component'

export type TargetableComponentTargetedEvent = EventDispatcherEvent<
  'targetable.targeted',
  { component: TargetableComponent }
>

export interface TargetableState extends ComponentState {
  isSelected: boolean
  isTargetable: boolean
}

export class TargetableComponent extends Component<TargetableState> {
  public static create(data?: Partial<TargetableState>) {
    return new TargetableComponent(uuid(), {
      isDisabled: false,
      isSelected: false,
      isTargetable: false,
      ...data
    })
  }

  constructor(id: TargetableComponent['id'], state: TargetableState) {
    super({ id, name: 'Targetable' }, state)
  }

  public isTargetable(val: TargetableState['isTargetable']): void {
    this.store.setState({ isTargetable: val })
  }

  public select(): void {
    const { isDisabled, isTargetable } = this.getState()

    if (isDisabled || !isTargetable) {
      return
    }

    this.store.setState({ isSelected: true })
    this.getActiveScene().dispatchEvent<TargetableComponentTargetedEvent>(
      'targetable.targeted',
      {
        component: this
      }
    )
  }
}
