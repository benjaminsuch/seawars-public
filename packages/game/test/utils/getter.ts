import { Component } from '../../src/core/Component'
import { GameObject } from '../../src/core/GameObject'

export const getComponent = <T extends Component<any>>(
  gameObject: GameObject,
  name: string
) => {
  const component = gameObject.components.get<T>(name)
  expect(component).toBeDefined()
  return component
}
