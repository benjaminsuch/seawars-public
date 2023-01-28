import type { FC, ReactNode } from 'react'

import type { ServerError } from 'core/useNetworkClient'

import * as seawars from '@seawars/game'
import { createContext, useContext, useState } from 'react'

import { storage } from 'core/storage'
import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'
import { isErrorResponse } from 'core/useNetworkClient'

export type UserContextValue = seawars.UserData

export const UserContext = createContext<UserContextValue | null>(null)
UserContext.displayName = 'UserProviderContext'

export interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [id, setId] = useState('')

  useIsomorphicLayoutEffect(() => {
    storage.user
      .getItem<seawars.User['id']>('id')
      .then(async id => {
        if (!id) {
          return seawars.User.register()
        }
        return seawars.User.acknowledge(id)
      })
      .then(async (response: seawars.UserData | ServerError) => {
        if (!response || isErrorResponse(response)) {
          throw response
        }

        const { id } = response

        await storage.user.setItem('id', id)
        setId(id)
      })
      .catch(error => console.log(error))
  }, [])

  const context = { id }

  if (!id) {
    return null
  }

  return <UserContext.Provider value={context}>{children}</UserContext.Provider>
}

export const useUserContext = (): UserContextValue => {
  const context = useContext(UserContext)

  if (!context) {
    throw `UserProvider context is undefined. Please make sure to call useUserContext as a child of <UserProvider>.`
  }

  return context
}
