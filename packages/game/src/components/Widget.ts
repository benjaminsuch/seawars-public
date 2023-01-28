import type { ComponentState } from '../core/Component'

import { v4 as uuid } from 'uuid'

import { Component } from '../core/Component'

export interface WidgetState extends ComponentState {
  renderComponent: string
}

export class WidgetComponent extends Component<WidgetState> {
  public static create(renderComponent: string) {
    return new WidgetComponent(uuid(), { isDisabled: false, renderComponent })
  }

  constructor(id: WidgetComponent['id'], state: WidgetState) {
    super({ id, name: 'Widget' }, state)
  }
}
