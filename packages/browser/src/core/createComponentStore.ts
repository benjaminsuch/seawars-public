import * as seawars from '@seawars/game'
import createStore from 'zustand/vanilla'

import { useGameObject } from 'core/GameObject'
import { useStore } from 'core/useStore'

export const createComponentStore =
  <T extends seawars.Component<any>>(name: T['name']) =>
  () => {
    const { gameObject } = useGameObject()
    const component = gameObject.getComponent<T>(name)

    if (!component) {
      console.warn(
        `Unable to find component "${name}". ` +
          `An empty store will be created to avoid issues with 'useStore' hook.`
      )
    }

    return useStore(component?.store ?? createStore(() => ({}))) as ReturnType<
      T['getState']
    >
  }
