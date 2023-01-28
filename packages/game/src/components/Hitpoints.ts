import type { ComponentState } from '../core/Component'

import { v4 as uuid } from 'uuid'

import { Component } from '../core/Component'

export interface HitpointsState extends ComponentState {
  current: number
  max: number
}

export class HitpointsComponent extends Component<HitpointsState> {
  public static create(data?: Partial<HitpointsState>) {
    return new HitpointsComponent(uuid(), {
      current: 8,
      max: 8,
      isDisabled: false,
      ...data
    })
  }

  constructor(id: HitpointsComponent['id'], state: HitpointsState) {
    super({ id, name: 'Hitpoints' }, state)
  }

  public setHitpoints(val: number): void {
    this.store.setState({ current: val })
  }
}
