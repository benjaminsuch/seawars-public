import type { ComponentType, Dispatch, FC, ReactNode, SetStateAction, VFC } from 'react'

import * as seawars from '@seawars/game'
import { createContext, Suspense, useContext, useEffect, useState } from 'react'
import { ChakraProvider, Flex, Heading, Text } from '@chakra-ui/react'
import { Html, Preload, useContextBridge, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { UserContext } from 'ui/UserProvider'

export const isSSR = typeof window === 'undefined'

export type GameContextValue = seawars.Game

export const GameContext = createContext<GameContextValue | null>(null)
GameContext.displayName = 'Game'

const createDebugConsole = (
  state: Record<string, any>,
  set: Dispatch<SetStateAction<Record<string, any>>>
) => {
  window['seawars'] = {
    debugInfo() {
      set({ ...state, debugInfo: !state.debugInfo })
    },
    getState() {
      return state
    }
  }
}

// Creating an empty debug console to avoid errors in the first render. Stupid fix, but works for now.
if (!isSSR) {
  createDebugConsole({}, () => {})
}

export interface GameProps {
  children: ReactNode
}

export const Game: FC<GameProps> = ({ children }: GameProps) => {
  const [debugState, setDebugState] = useState<Record<string, any>>({
    debugInfo: true
  })
  let game: seawars.Game | null = null

  try {
    game = seawars.Game.instance()
  } catch (error) {
    game = new seawars.Game()
  }

  useEffect(() => {
    createDebugConsole(debugState, setDebugState)
  }, [debugState])

  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export const Render: FC = ({ children }) => {
  const ContextBridge = useContextBridge(GameContext, UserContext)

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 650, 0], fov: 55, near: 1, far: 5000 }}
      shadows
      frameloop="demand"
    >
      <Loader>
        <ContextBridge>
          <Suspense fallback={null}>{children}</Suspense>
          <Preload all />
        </ContextBridge>
      </Loader>
    </Canvas>
  )
}

export const withRender = <P extends object>(Component: ComponentType<P>) => {
  const Wrapper: VFC<P> = props => (
    <Render>
      <Component {...props} />
    </Render>
  )
  Wrapper.displayName = `withRender(${Component.displayName || Component.name})`

  return Wrapper
}

export const Loader = ({ children }) => {
  const { active, progress } = useProgress()

  if (!active) {
    return children
  }

  return (
    <Html center>
      <ChakraProvider resetCSS={false}>
        <Flex direction="column" align="center">
          <Heading size="4xl" whiteSpace="nowrap">
            Sea Wars
          </Heading>
          <Text as="span" color="gray.500" fontSize="xl" whiteSpace="nowrap">
            Loading... {progress.toFixed(2)}%
          </Text>
        </Flex>
      </ChakraProvider>
    </Html>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)

  if (!context) {
    throw `Game context is undefined. Please make sure to call useGame as a child of <Game>.`
  }

  return context
}
