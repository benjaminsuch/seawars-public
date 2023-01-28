import Head from 'next/head'
import * as seawars from '@seawars/game'
import { Suspense, useState } from 'react'
import { Global } from '@emotion/react'
import { AppProps } from 'next/app'
import { Box, ChakraProvider } from '@chakra-ui/react'

import { Game } from 'core/Game'
import { Stats } from 'core/Stats'
import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'
import { theme, fonts } from 'ui/themes/default'
import { UserProvider } from 'ui/UserProvider'

const client = new seawars.NetworkClient(process.env.NEXT_PUBLIC_WEBSOCKET!)

export default function App({ Component, pageProps }: AppProps) {
  const [isReady, setIsReady] = useState(false)

  useIsomorphicLayoutEffect(() => {
    client.connect()
    client.on('open', () => setIsReady(true))
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <>
      <Head>
        <title>Sea Wars</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ChakraProvider theme={theme}>
        <Global styles={fonts} />
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          overflow="hidden"
          suppressHydrationWarning
        >
          <Game>
            <UserProvider>
              <Component {...pageProps} />
            </UserProvider>
            <Suspense fallback={null}>
              <Stats />
            </Suspense>
          </Game>
        </Box>
      </ChakraProvider>
    </>
  )
}
