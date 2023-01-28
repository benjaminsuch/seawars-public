import { DependencyList, useEffect } from 'react'
import * as seawars from '@seawars/game'

export interface ServerError {
  code: number
  message: string
  data: Record<string, any>
}

export const useNetworkClient = (
  callback: (client: seawars.NetworkClient) => void | Promise<void>,
  deps: DependencyList = []
) => {
  useEffect(() => {
    const client = seawars.NetworkClient.instance()
    const handler = async () => callback(client)

    if (!client.isOpen) {
      client.on('open', handler)
    } else {
      handler()
    }

    return () => {
      client.off('open', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps])
}

export const isErrorResponse = (response: unknown): response is ServerError => {
  if (typeof response === 'object' && response !== null) {
    return response.hasOwnProperty('code')
  }
  return false
}
