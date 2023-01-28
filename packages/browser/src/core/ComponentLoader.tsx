import type { VFC } from 'react'

import * as seawars from '@seawars/game'

import { components } from '../components'

export interface ComponentLoaderProps<T = seawars.Component<any>> {
  component: T
  gameObject: seawars.GameObject
  name: string
}

export const ComponentLoader: VFC<ComponentLoaderProps> = ({ name, ...props }) => {
  const key = `${name}Component` as keyof typeof components
  const Component = components[key] ?? (() => null)
  return <Component {...(props as any)} />
}
