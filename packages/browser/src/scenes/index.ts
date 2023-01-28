import * as seawars from '@seawars/game'

import { BattlefieldScene } from './Battlefield'
import { DefaultScene } from './DefaultScene'

const scenes = { BattlefieldScene, DefaultScene }

export const getSceneRenderComponent = (name: seawars.Scene['name']) => {
  if (!scenes[`${name}Scene`]) {
    throw new Error(`Cannot load unknown scene "${name}".`)
  }
  return scenes[`${name}Scene`] as typeof scenes[keyof typeof scenes]
}
