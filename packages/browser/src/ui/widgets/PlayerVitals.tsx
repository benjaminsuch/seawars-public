import type { VFC } from 'react'

import * as seawars from '@seawars/game'
import { Flex, Stack, Text } from '@chakra-ui/react'
import { useStore } from 'core/useStore'

export interface PlayerVitalsProps {
  name: string
  isFlipped?: boolean
  store: seawars.Player['store']
}

export const PlayerVitalsWidget: VFC<PlayerVitalsProps> = ({
  store,
  isFlipped,
  name
}) => {
  const { color, isOnline, score } = useStore(store)

  const info = [
    <Stack
      key="name"
      spacing={0}
      textTransform="uppercase"
      align={isFlipped ? 'end' : 'start'}
    >
      <Text as="span" fontSize="xs" color={isOnline ? 'green.300' : 'red.300'}>
        {isOnline ? 'Online' : 'Offline'}
      </Text>
      <Text as="span">{name}</Text>
    </Stack>,
    <Text as="span" key="points" fontSize="3xl" fontWeight={400}>
      {score}
    </Text>
  ]

  const style = isFlipped ? { borderRightWidth: 5 } : { borderLeftWidth: 5 }

  if (isFlipped) {
    info.reverse()
  }

  return (
    <Flex
      color="white"
      w="280px"
      p={2}
      transform={`skewY(${!isFlipped ? '1deg' : '-1deg'})`}
      bgColor="blackAlpha.400"
      backdropFilter="auto"
      backdropBlur="8px"
      borderRadius={4}
      border="1px solid"
      borderColor={color === seawars.PlayerColors.Blue ? 'blueAlpha.700' : 'redAlpha.700'}
      {...style}
    >
      <Stack
        direction="row"
        justify="space-between"
        align="start"
        textShadow="1px 1px 0 rgba(0, 0, 0, 1)"
        flexGrow={1}
      >
        {info}
      </Stack>
    </Flex>
  )
}
