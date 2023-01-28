import type { ComponentState } from '../core/Component'
import type { EventDispatcherEvent } from '../core/EventDispatcher'

import { v4 as uuid } from 'uuid'

import { Component } from '../core/Component'

export type SelectableComponentSelectedEvent = EventDispatcherEvent<
  'gameObject.selected',
  { component: SelectableComponent }
>

export type SelectableComponentUnselectedEvent = EventDispatcherEvent<
  'gameObject.unselected',
  { component: SelectableComponent }
>

export interface SelectableState extends ComponentState {
  isSelected: boolean
}

export class SelectableComponent extends Component<SelectableState> {
  public static create(data?: Partial<SelectableState>): SelectableComponent {
    return new SelectableComponent(uuid(), {
      isSelected: false,
      isDisabled: false,
      ...data
    })
  }

  constructor(id: SelectableComponent['id'], state: SelectableState) {
    super({ id, name: 'Selectable' }, state)
  }

  public select(): void {
    const { isDisabled, isSelected } = this.getState()

    if (isDisabled) {
      return
    }

    if (!isSelected) {
      this.store.setState({ isSelected: true })
      this.getActiveScene().dispatchEvent<SelectableComponentSelectedEvent>(
        'gameObject.selected',
        {
          component: this
        }
      )
    }
  }

  public unselect(): void {
    const { isDisabled, isSelected } = this.getState()

    if (isDisabled) {
      return
    }

    if (isSelected) {
      this.store.setState({ isSelected: false })
      this.getActiveScene().dispatchEvent<SelectableComponentUnselectedEvent>(
        'gameObject.unselected',
        {
          component: this
        }
      )
    }
  }

  public toggle(): void {
    if (this.getState().isSelected) {
      this.unselect()
    } else {
      this.select()
    }
  }
}
