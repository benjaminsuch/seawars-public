import { Box, Stack } from '@chakra-ui/react'
import { useMemo, VFC } from 'react'

export interface HitpointsProps {
  current: number
  max: number
  height?: number
  spacing?: number
}

export const Hitpoints: VFC<HitpointsProps> = ({
  current,
  max,
  height = 2,
  spacing = 1
}) => {
  const hitpoints = useMemo(
    () =>
      new Array(max)
        .fill(null)
        .map((_, idx) => (
          <Box
            key={idx}
            w="100%"
            height={height}
            bgColor={idx + 1 > current ? 'blackAlpha.500' : 'green.300'}
          />
        )),
    [current, height, max]
  )

  return (
    <Stack direction="row" justify="space-evenly" spacing={spacing}>
      {hitpoints}
    </Stack>
  )
}
