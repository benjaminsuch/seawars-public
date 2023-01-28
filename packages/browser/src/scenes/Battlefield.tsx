import * as seawars from '@seawars/game'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Box, Button, Stack, Text } from '@chakra-ui/react'
import { Sky } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useRef, VFC } from 'react'

import { isSSR, useGame, withRender } from 'core/Game'
import { GameObject } from 'core/GameObject'
import { MapControls } from 'core/MapControls'
import { useActiveScene } from 'core/useActiveScene'
import { getGlobalAudioListener } from 'core/audio'
import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'
import { useStore } from 'core/useStore'
import { withScene } from 'core/withScene'
import { PacificOcean } from 'maps/PacificOcean'
import { Html, Placement } from 'ui/common'
import { CountdownWidget } from 'ui/widgets'
import { useUserContext } from 'ui/UserProvider'
import { Island } from 'models/Island'

export interface BattlefieldSceneProps {
  scene: seawars.Scene
  match: seawars.Match
}

let _match: seawars.Match

export const getMatch = () => _match

// @refresh reset
export const BattlefieldScene = withRender<BattlefieldSceneProps>(
  withScene(({ match }) => {
    const game = useGame()
    const sceneRef = useRef<THREE.Scene>()
    const camera = useThree(state => state.camera)
    const invalidate = useThree(state => state.invalidate)
    const scene = useActiveScene()
    const { gameObjects } = useStore(scene.store)

    useIsomorphicLayoutEffect(() => {
      if (!_match) {
        match.spawnGameObjects()
      }
      _match = match
    }, [match])

    useIsomorphicLayoutEffect(() => {
      if (!isSSR) {
        camera.add(getGlobalAudioListener())
      }
    }, [])

    useFrame(({ clock }, delta) => {
      game.requestTick({ delta, elapsedTime: clock.elapsedTime })

      if (sceneRef.current) {
        invalidate()
      }
    })

    // const ISLAND_SCALE = 7.5

    return (
      <>
        <scene ref={sceneRef}>
          <color attach="background" args={['#222326']} />
          <ambientLight />
          <directionalLight
            position={[0, 50, 150]}
            intensity={1}
            shadow-bias={-0.001}
            shadow-mapSize={[4096, 4096]}
            shadow-camera-left={-150}
            shadow-camera-right={150}
            shadow-camera-top={150}
            shadow-camera-bottom={-150}
            castShadow
          />
          <Sky
            // @ts-ignore
            scale={5000}
            sunPosition={[100, 100, -75]}
            turbidity={0}
            mieCoefficient={0.1}
            mieDirectionalG={0.97}
            distance={1000}
            rayleigh={0.1}
            inclination={0}
          />
          <PacificOcean />
          {/*<group
            scale={ISLAND_SCALE}
            position={[0, ISLAND_SCALE * 6.75, 0]}
            rotation={[Math.PI * 0.5, 0, 0]}
          >
            <Island />
    </group>*/}
          <Controls match={match} />
          {gameObjects
            .filter(gameObject => gameObject.tags.has('board'))
            .map(({ id }) => (
              <GameObject key={id} id={id} />
            ))}
        </scene>
        <Perf headless />
        <MapControls />
      </>
    )
  })
)

const Controls: VFC<{ match: seawars.Match }> = ({ match }) => {
  const user = useUserContext()
  const { activePlayer, currentTurn, turnEndsAt } = useStore(match.store)

  return (
    <Html>
      <Placement position="top">
        <Stack justify="center" spacing={0}>
          <Text color="whiteAlpha.800" align="center">
            Turn {currentTurn}
          </Text>
          {turnEndsAt && <CountdownWidget endTime={new Date(turnEndsAt)} />}
        </Stack>
      </Placement>
      <Placement position="right">
        <Box pr={4}>
          <Button
            colorScheme="yellow"
            isDisabled={user.id !== activePlayer}
            onClick={() => match.endTurn()}
            borderRadius={2}
            size="lg"
          >
            End Turn
          </Button>
        </Box>
      </Placement>
    </Html>
  )
}
