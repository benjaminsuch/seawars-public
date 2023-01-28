import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useShipStore = createComponentStore<seawars.ShipComponent>('Ship')
