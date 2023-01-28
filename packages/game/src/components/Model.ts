import { v4 as uuid } from 'uuid'

import { Component, ComponentState } from '../core/Component'

export interface ModelState extends ComponentState {
  name: string
}

export type ModelComponentCreateData = Pick<ModelState, 'name'> &
  Partial<Omit<ModelState, 'name'>>

export class ModelComponent extends Component<ModelState> {
  static create(data: ModelComponentCreateData) {
    return new ModelComponent(uuid(), { isDisabled: false, ...data })
  }

  constructor(id: ModelComponent['id'], state: ModelState) {
    super({ id, name: 'Model' }, state)
  }
}
