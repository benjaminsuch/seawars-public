import { Flex, FlexProps, Portal } from '@chakra-ui/react'
import { FC, useMemo } from 'react'

export interface PlacementProps {
  position:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'right'
}

export const Placement: FC<PlacementProps> = ({ children, position }) => {
  const styles = useMemo<Pick<FlexProps, 'bottom' | 'left' | 'top' | 'right'>>(() => {
    switch (position) {
      case 'top':
        return {
          top: 4,
          left: '50%',
          right: 'unset',
          bottom: 'unset',
          transform: 'translateX(-50%)'
        }
      case 'top-left':
        return {
          top: 4,
          left: 4,
          right: 'unset',
          bottom: 'unset'
        }
      case 'top-right':
        return {
          top: 4,
          left: 'unset',
          right: 4,
          bottom: 'unset'
        }
      case 'bottom':
        return {
          top: 'unset',
          left: '50%',
          right: 'unset',
          bottom: 4,
          transform: 'translateX(-50%)'
        }
      case 'bottom-left':
        return {
          top: 'unset',
          left: 4,
          right: 'unset',
          bottom: 4
        }
      case 'bottom-right':
        return {
          top: 'unset',
          left: 'unset',
          right: 4,
          bottom: 4
        }
      case 'left':
        return {
          top: '50%',
          left: 0,
          right: 'unset',
          bottom: 'unset',
          transform: 'translateY(-50%)'
        }
      case 'right':
        return {
          top: '50%',
          right: 0,
          left: 'unset',
          bottom: 'unset',
          transform: 'translateY(-50%)'
        }
      default:
        return {
          top: 4,
          left: 4,
          right: 'unset',
          bottom: 'unset'
        }
    }
  }, [position])

  return (
    <Portal>
      <Flex pos="fixed" {...styles} p={4} zIndex={1000} maxW="25vw">
        {children}
      </Flex>
    </Portal>
  )
}
