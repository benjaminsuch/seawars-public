import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useInventoryStore =
  createComponentStore<seawars.InventoryComponent>('Inventory')
