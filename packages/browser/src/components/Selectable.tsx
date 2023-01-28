import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useSelectableStore =
  createComponentStore<seawars.SelectableComponent>('Selectable')
