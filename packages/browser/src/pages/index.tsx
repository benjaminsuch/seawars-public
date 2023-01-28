import type { VFC } from 'react'

import * as seawars from '@seawars/game'
import { Button, Flex, Heading, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import { isErrorResponse } from 'core/useNetworkClient'

const HomePage: VFC = () => {
  const router = useRouter()

  const handleCreateGame = async () => {
    try {
      const response = await seawars.Match.create()

      if (isErrorResponse(response)) {
        throw response
      }

      router.push(`/lobby/${response?.alias}`)
    } catch (error: unknown) {
      console.log(error)
    }
  }

  return (
    <Flex
      bgImage="/assets/images/menu_bg.jpg"
      bgRepeat="none"
      bgSize="cover"
      h="100%"
      direction="column"
    >
      <Flex
        direction="column"
        flex={1}
        bgColor="whiteAlpha.100"
        backdropFilter="auto"
        align="center"
        justify="stretch"
      >
        <Flex flex={1}>
          <Heading
            color="white"
            textAlign="center"
            size="4xl"
            textShadow="0 0 2rem rgba(0, 0, 0, 0.5)"
            pt={16}
          >
            Sea Wars
          </Heading>
        </Flex>
        <Stack flex={2} align="center" spacing={16}>
          <Button w={250} colorScheme="yellow" onClick={handleCreateGame} size="lg">
            New Game
          </Button>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default HomePage
