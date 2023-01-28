import { useEffect, useRef, useState } from 'react'

export interface UseCountdownOptions {
  endTime: Date
  /**
   * In milliseconds. Default is: 1000
   */
  steps?: number
  isDisabled?: boolean
}

export const useCountdown = ({
  endTime,
  steps = 1000,
  isDisabled
}: UseCountdownOptions) => {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timer>()

  useEffect(() => {
    if (!isDisabled) {
      const date = new Date()

      setSeconds(
        calcSeconds(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds()) -
          calcSeconds(date.getHours(), date.getMinutes(), date.getSeconds())
      )

      intervalRef.current = setInterval(() => {
        setSeconds(current => {
          if (current === 0) {
            clearInterval(intervalRef.current as unknown as number)
            return current
          }

          return Math.round((current * 1000 - steps) / 1000)
        })
      }, steps)

      return () => {
        clearInterval(intervalRef.current as unknown as number)
      }
    }
  }, [endTime, isDisabled, steps])

  return { value: seconds }
}

const calcSeconds = (hours: number, minutes: number, seconds: number) =>
  hours * 60 * 60 + minutes * 60 + seconds
