import type { ComponentType, VFC } from 'react'

import * as seawars from '@seawars/game'
import { Box, Button, Flex, Heading, Spacer, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'
import { useStore } from 'core/useStore'
import { useUserContext } from './UserProvider'

export type LobbyContextValue = { match: seawars.Match }

export const LobbyContext = createContext<LobbyContextValue | null>(null)
LobbyContext.displayName = 'LobbyContext'

export interface LobbyProps {
  alias: seawars.Match['alias']
}

export const Lobby: VFC<LobbyProps> = ({ alias }) => {
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

  const context: LobbyContextValue = { match }
  const player = match.getPlayerById(user.id)

  return (
    <LobbyContext.Provider value={context}>
      <Flex
        bgImage="/assets/images/menu_bg.jpg"
        bgRepeat="none"
        bgSize="cover"
        pos="relative"
        h="100%"
        color="white"
      >
        <Flex
          direction="column"
          flex={1}
          bgColor="blackAlpha.500"
          backdropFilter="auto"
          backdropBlur="10px"
          align="center"
          justify="center"
        >
          <Stack w={{ sm: '90vw', xl: '75vw' }}>
            <Heading size="xl" textTransform="uppercase" fontWeight={400}>
              Game Lobby
            </Heading>
            <Stack direction="row">
              <Stack flexGrow={1} justify="space-between">
                <Slots />
              </Stack>
              <Stack justify="space-between">
                <BattlefieldInfo battlefield={match.battlefield} />
                <Spacer />
                <Stack>
                  <ReadyButton />
                  {player?.isHost && <StartButton />}
                  <JoinButton player={player} />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Countdown />
        </Flex>
      </Flex>
    </LobbyContext.Provider>
  )
}

export const useLobbyContext = (): LobbyContextValue => {
  const context = useContext(LobbyContext)

  if (!context) {
    throw `Lobby context is undefined. Please make sure to call useLobbyContext as a child of <Lobby>.`
  }

  return context
}

const withPlayer = <P extends object>(
  Component: ComponentType<P & { player: seawars.Player }>
) => {
  const Wrapper: VFC<P> = props => {
    const user = useUserContext()
    const { match } = useLobbyContext()

    useStore(match.store, ({ players }) => players)

    const player = match.getPlayerById(user.id)

    if (!player) {
      return null
    }

    return <Component {...props} player={player} />
  }
  Wrapper.displayName = `withPlayer(${Component.displayName || Component.name})`

  return Wrapper
}

const Slots = () => {
  const { match } = useLobbyContext()
  const players = useStore(match.store, ({ players }) => players)
  const { maxPlayers } = match.battlefield

  const slots = useMemo(
    () => new Array(maxPlayers).fill(null).map((_, idx) => players[idx]),
    [maxPlayers, players]
  )

  return (
    <Stack spacing={1}>
      {slots.map((player, idx) =>
        player ? (
          <PlayerSlot key={player.id} player={player} />
        ) : (
          <EmptyPlayerSlot key={idx} />
        )
      )}
    </Stack>
  )
}

const EmptyPlayerSlot = () => (
  <Flex justify="center" align="center" bgColor="whiteAlpha.300" h={10} px={2}>
    <Text as="span" color="whiteAlpha.700">
      Open slot
    </Text>
  </Flex>
)

interface PlayerSlotProps {
  player: seawars.Player
}

const PlayerSlot: VFC<PlayerSlotProps> = ({ player }) => {
  const state = useStore(player.store)

  return (
    <Stack direction="row" align="center" bgColor="whiteAlpha.500">
      <Box h={10} w={2} bgColor={state.color} />
      <Flex flexGrow={1} align="baseline">
        <Text
          as="span"
          fontSize="lg"
          color="whiteAlpha.900"
          textShadow="1px 1px 0 #000"
          textTransform="uppercase"
        >
          {player.name}
        </Text>
        <Text
          as="span"
          fontSize="xs"
          bgColor="green.400"
          //color={state.isOnline ? 'green.400' : 'red.400'}
          px={1}
          ml={1}
          textTransform="uppercase"
        >
          {state.isOnline ? 'Online' : 'Offline'}
        </Text>
      </Flex>
      <Flex pr={2}>
        {state.isReady && (
          <Text as="span" color="green.300" textShadow="1px 1px 0 #000">
            Ready
          </Text>
        )}
      </Flex>
    </Stack>
  )
}

interface BattlefieldInfoProps {
  battlefield: seawars.Match['battlefield']
}

const BattlefieldInfo: VFC<BattlefieldInfoProps> = ({ battlefield }) => {
  const { label, x, y, maxPlayers, minPlayers } = battlefield

  return (
    <Stack>
      <Flex h="225px" w="225px" bgColor="blackAlpha.600" justify="center" align="center">
        <Text as="span" color="whiteAlpha.700">
          No Image
        </Text>
      </Flex>
      <Stack fontSize="sm" spacing={1}>
        <Flex justify="space-between">
          <Text as="span">Name:</Text>
          <Text as="span">{label}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text as="span">Size:</Text>
          <Text as="span">
            {x}x{y}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text as="span">Min. players:</Text>
          <Text as="span">{minPlayers}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text as="span">Max. players:</Text>
          <Text as="span">{maxPlayers}</Text>
        </Flex>
      </Stack>
    </Stack>
  )
}

interface JoinButtonProps {
  player?: seawars.Player
}

const JoinButton: VFC<JoinButtonProps> = () => {
  const user = useUserContext()
  const { match } = useLobbyContext()
  const { state } = useStore(match.store)

  const player = match.getPlayerById(user.id)
  const canJoin = !player && match.isOpen()
  const canLeave = !!player && state === seawars.MatchState.Idle
  const isDisabled = !canJoin && !canLeave

  const handlePointerUp = async () => {
    // `isDisabled` unfortunately does not disable pointer events
    if (isDisabled) {
      return
    }

    if (!player) {
      await match.registerPlayer(user.id)
    } else {
      await match.unregisterPlayer(user.id)
    }
  }

  if (player?.isHost) {
    return null
  }

  return (
    <Button
      colorScheme="whiteAlpha"
      size="lg"
      isFullWidth
      onPointerUp={handlePointerUp}
      isDisabled={isDisabled}
    >
      {!player ? 'Join Game' : 'Leave Game'}
    </Button>
  )
}

const ReadyButton = withPlayer(({ player }) => {
  const { match } = useLobbyContext()
  const { state } = useStore(match.store)
  const isReady = useStore(player.store, ({ isReady }) => isReady)
  const isDisabled = state !== seawars.MatchState.Idle

  const handlePointerUp = () => {
    if (isDisabled) {
      return
    }

    if (isReady) {
      player.unready()
    } else {
      player.ready()
    }
  }

  return (
    <Button
      colorScheme={isReady ? 'whiteAlpha' : 'yellow'}
      size="lg"
      isFullWidth
      onPointerUp={handlePointerUp}
      isDisabled={isDisabled}
    >
      {isReady ? 'Unready' : 'Ready'}
    </Button>
  )
})

interface StartButtonProps {}

const StartButton: VFC<StartButtonProps> = () => {
  const { match } = useLobbyContext()

  useStore(match.store)

  const isDisabled = !match.canStart()

  const handlePointerUp = () => {
    if (!isDisabled) {
      match.start()
    }
  }

  return (
    <Button
      colorScheme="blue"
      size="lg"
      isFullWidth
      onPointerUp={handlePointerUp}
      isDisabled={isDisabled}
    >
      Start
    </Button>
  )
}

const Countdown: VFC = () => {
  const router = useRouter()
  const { match } = useLobbyContext()
  const { countdown, state } = useStore(match.store)

  useEffect(() => {
    if (state === seawars.MatchState.Running) {
      router.push(`/game/${match.alias}`)
    }
  }, [match.alias, router, state])

  if (state !== seawars.MatchState.Started || !countdown) {
    return null
  }

  return (
    <Flex
      pos="absolute"
      direction="column"
      top={0}
      left={0}
      w="100%"
      h="100%"
      justify="center"
      align="center"
      bgColor="blackAlpha.500"
    >
      <Text as="span" fontSize={32} textShadow="1px 1px 1px #000">
        Start in...
      </Text>
      <Text as="span" fontSize={60} textShadow="1px 1px 1px #000" fontWeight="bold">
        {countdown}
      </Text>
    </Flex>
  )
}
