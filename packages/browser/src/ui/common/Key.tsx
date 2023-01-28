import { FC } from 'react'
import { Text } from '@chakra-ui/react'

export interface KeyProps {}

export const Key: FC<KeyProps> = ({ children }) => {
  return (
    <Text
      as="span"
      bgColor="blackAlpha.500"
      border="1px solid"
      borderColor="whiteAlpha.300"
      borderRadius={2}
      color="white"
      fontSize="xs"
      lineHeight="14px"
      px={1.5}
    >
      {children}
    </Text>
  )
}
