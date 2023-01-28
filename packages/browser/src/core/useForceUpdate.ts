import { useCallback, useState } from 'react'

export const useForceUpdate = () => {
  const [count, setCount] = useState(0)
  return useCallback(() => setCount(count + 1), [count])
}
