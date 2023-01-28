import type { DependencyList } from 'react'

import { useEffect, useRef } from 'react'

export const useDebounce = (fn: Function, ms: number = 0, deps: DependencyList = []) => {
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const clear = () => timeout.current && clearTimeout(timeout.current)

    timeout.current = setTimeout(() => {
      clear()
      fn()
    }, ms)

    return () => clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, fn, ms])
}
