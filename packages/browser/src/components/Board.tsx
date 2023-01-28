import * as seawars from '@seawars/game'

import { createComponentStore } from 'core/createComponentStore'

export const useBoardStore = createComponentStore<seawars.BoardComponent>('Board')
