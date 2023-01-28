import type { ComponentType, VFC } from 'react'

import * as seawars from '@seawars/game'
import { createContext } from 'react'

export const GameSceneContext = createContext<seawars.Scene | null>(null)
GameSceneContext.displayName = 'GameScene'

export interface GameSceneProps {
  scene: seawars.Scene
}

export const withScene = <P extends object>(SceneComponent: ComponentType<P>) => {
  const Wrapper: VFC<P & GameSceneProps> = ({ scene, ...props }) => (
    <GameSceneContext.Provider value={scene}>
      <SceneComponent {...(props as P)} />
    </GameSceneContext.Provider>
  )
  Wrapper.displayName = `withScene(${SceneComponent.displayName ?? SceneComponent.name})`

  return Wrapper
}
