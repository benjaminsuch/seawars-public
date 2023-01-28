import { FC } from 'react'
import { Flex } from '@chakra-ui/react'

export interface SkewedBoxProps {}

export const SkewedBox: FC<SkewedBoxProps> = ({ children }) => {
  return (
    <Flex transform="perspective(0) rotateY(0deg) skew(2deg, -2.5deg);" userSelect="none">
      {children}
    </Flex>
  )
}
