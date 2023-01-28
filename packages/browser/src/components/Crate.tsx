import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useCrateStore = createComponentStore<seawars.CrateComponent>('Crate')
