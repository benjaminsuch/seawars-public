import type { VFC } from 'react'

import type { ComponentLoaderProps } from 'core/ComponentLoader'

import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'
import { getWidgetComponent } from 'ui/widgets'

export const useWidgetStore = createComponentStore<seawars.WidgetComponent>('Widget')

export const WidgetComponent: VFC<
  Omit<ComponentLoaderProps<seawars.WidgetComponent>, 'name'>
> = ({ component }) => {
  const { renderComponent } = component.getState()
  const Component = getWidgetComponent(renderComponent)

  return <Component />
}
