import type { StateSelector, StoreApi } from 'zustand'

import createStore from 'zustand'

type State<Store> = Store extends StoreApi<infer S> ? S : never

export const useStore = <T extends StoreApi<any>>(
  stateCreator: T,
  getter?: T extends StoreApi<infer S> ? StateSelector<S, S[keyof S]> : never
) => createStore<State<T>>(stateCreator)(getter ?? (state => state))
