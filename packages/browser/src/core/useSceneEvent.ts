import * as seawars from '@seawars/game'
import { useEffect } from 'react'

import { useActiveScene } from './useActiveScene'

export function useSceneEvent<T>(
  name: seawars.ExtractName<T>,
  listener: seawars.DispatchedEventListener<T>,
  deps: unknown[] = []
) {
  const scene = useActiveScene()

  useEffect(
    () => scene.addEventListener<T>(name, listener),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listener, ...deps]
  )
}
