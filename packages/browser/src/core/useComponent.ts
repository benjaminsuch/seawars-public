import * as seawars from '@seawars/game'
import { useEffect } from 'react'

import { useGameObject } from './GameObject'

const isTransformComponent = (
  component?: seawars.Component<any>
): component is seawars.TransformComponent => component?.name === 'Transform'

export const useComponent = <T extends seawars.Component<any>>(name: T['name']) => {
  const { gameObject } = useGameObject()
  const component = gameObject.getComponent<T>(name)

  if (!component) {
    throw new Error(`useComponent: Component with name "${name}" couldn't be found.`)
  }

  if (isTransformComponent(component)) {
    return component
  }

  return component
}

export const useComponentEvent = <T>(
  component: seawars.Component<seawars.ComponentState>,
  name: seawars.ExtractName<T>,
  listener: seawars.DispatchedEventListener<T>,
  deps: unknown[] = []
) => {
  useEffect(
    () => component.addEventListener<T>(name, listener),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listener, ...deps]
  )
}
