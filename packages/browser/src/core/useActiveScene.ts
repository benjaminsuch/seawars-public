import { useContext } from 'react'

import { GameSceneContext } from './withScene'

export const useActiveScene = () => {
  const context = useContext(GameSceneContext)

  if (!context) {
    throw `GameScene context is undefined. Please make sure to call useActiveScene as a child of <GameScene>.`
  }

  return context
}
