import type { VFC } from 'react'

import * as seawars from '@seawars/game'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { getSceneRenderComponent } from '../../scenes'
import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'
import { Placement, PlacementProps } from 'ui/common'
import { PlayerVitalsWidget } from 'ui/widgets'
import { useUserContext } from 'ui/UserProvider'

const GamePage: VFC = () => {
  const router = useRouter()
  const alias = router.query.alias as string
  const user = useUserContext()
  const [match, setMatch] = useState<seawars.Match>()

  useIsomorphicLayoutEffect(() => {
    if (!alias || !user?.id || match) {
      return
    }

    seawars.Match.load(alias).then(response => {
      if (seawars.env.IS_PROD) {
        if (!response) {
          throw new Error(`No match found for id ${alias}.`)
        }
      }
      if (response) {
        setMatch(response)
      }
    })
  }, [alias, match, user])

  if (!match) {
    return null
  }

  const { activeScene } = match.game.sceneManager
  const { players } = match.store.getState()
  const positions = ['top-left', 'top-right'] as PlacementProps['position'][]
  const Scene = getSceneRenderComponent(activeScene.name)

  return (
    <>
      <Scene match={match} scene={activeScene} />
      {players.map((player, idx) => (
        <Placement key={player.id} position={positions[idx]}>
          <PlayerVitalsWidget store={player.store} name={player.name} />
        </Placement>
      ))}
    </>
  )
}

export default GamePage
