import { FC, ReactNode, VFC } from 'react'
import { Flex, Portal, Stack, Text } from '@chakra-ui/react'
import { useDetectGPU } from '@react-three/drei'
import { usePerf } from 'r3f-perf'
import { Placement } from 'ui/common'

export const Stats: VFC = () => {
  const gpu = useDetectGPU()
  const { gl, log } = usePerf()
  const { debugInfo } = window['seawars'].getState()

  if (!debugInfo || !log || !gl) {
    return null
  }

  const { fps, maxMemory, mem } = log as {
    [key: string]: number
  }
  const { geometries, textures } = gl.memory
  const { triangles } = gl.render

  return (
    <Placement position="left">
      <Stack spacing={4} color="whiteAlpha.900" pl={4}>
        <StatGroup>
          <StatItem color="yellow" label="FPS" value={fps.toFixed(1)} />
          <StatItem label="Memory" value={`${mem} / ${maxMemory} mb`} />
          <StatItem label="GPU" value={gpu?.gpu?.toUpperCase()} />
        </StatGroup>
        <StatGroup>
          <StatItem color="yellow" label="Ping" value="-/-" />
          <StatItem label="Messages" value="0 / 0" />
        </StatGroup>
        <StatGroup>
          <StatItem label="Triangles" value={triangles} />
          <StatItem label="Geometries" value={geometries} />
          <StatItem label="Textures" value={textures} />
        </StatGroup>
      </Stack>
    </Placement>
  )
}

interface StatItemProps {
  color?: 'yellow' | 'red'
  label: ReactNode
  value: ReactNode
}

const StatGroup: FC = ({ children }) => <Stack spacing={0}>{children}</Stack>

const StatItem: VFC<StatItemProps> = ({ label, value, ...props }) => {
  const color =
    props.color === 'yellow'
      ? 'yellow.300'
      : props.color === 'red'
      ? 'red.300'
      : undefined

  return (
    <Stack direction="row" spacing={2} fontSize="xs" color={color}>
      <Text as="span">{label}:</Text>
      <Text as="span">{value}</Text>
    </Stack>
  )
}
