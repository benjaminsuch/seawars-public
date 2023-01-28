import { Text } from '@chakra-ui/react'
import { useEffect, VFC } from 'react'

import { globalAudio } from 'core/audio'
import { useCountdown, UseCountdownOptions } from 'core/useCountdown'

export interface CountdownWidgetProps extends Omit<UseCountdownOptions, 'isDisabled'> {}

export const CountdownWidget: VFC<CountdownWidgetProps> = ({ endTime, steps = 1000 }) => {
  const { value } = useCountdown({
    endTime,
    steps,
    isDisabled: endTime.getTime() <= new Date().getTime()
  })

  useEffect(() => {
    if (value <= 10) {
      //globalAudio('beep01').play()
    }
  }, [value])

  return (
    <Text
      color="white"
      fontSize="5xl"
      lineHeight="shorter"
      fontWeight={500}
      align="center"
    >
      {value}
    </Text>
  )
}
