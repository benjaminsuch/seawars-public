import { FC, PointerEventHandler, ReactNode, useMemo } from 'react'
import { Button, ButtonProps } from '@chakra-ui/react'
import { globalAudio } from 'core/audio'

export interface AbilityButtonProps extends Pick<ButtonProps, 'isDisabled'> {
  color?: string
  icon: ReactNode
  onPointerUp: ButtonProps['onPointerUp']
}

export const AbilityButton: FC<AbilityButtonProps> = ({
  children,
  color,
  icon,
  onPointerUp,
  isDisabled
}) => {
  const style = useMemo(() => {
    switch (color) {
      case 'red': {
        return {
          bgColor: 'red.700',
          color: 'red.100',
          borderColor: 'red.400',
          ...(!isDisabled
            ? {
                _hover: {
                  bgColor: 'red.600',
                  borderColor: 'red.300',
                  color: 'white'
                },
                _active: {
                  bgColor: 'red.600',
                  borderColor: 'red.300',
                  color: 'white'
                }
              }
            : {
                _hover: {
                  bgColor: 'red.700',
                  color: 'red.100',
                  borderColor: 'red.400'
                },
                _active: {
                  bgColor: 'red.700',
                  color: 'red.100',
                  borderColor: 'red.400'
                }
              })
        }
      }
      default: {
        return {
          bgColor: 'gray.600',
          color: 'gray.300',
          borderColor: 'gray.400',
          ...(!isDisabled
            ? {
                _hover: {
                  bgColor: 'gray.500',
                  borderColor: 'gray.300',
                  color: 'white'
                },
                _active: {
                  bgColor: 'gray.500',
                  borderColor: 'gray.300',
                  color: 'white'
                }
              }
            : {
                _hover: {
                  bgColor: 'gray.600',
                  color: 'gray.300',
                  borderColor: 'gray.400'
                },
                _active: {
                  bgColor: 'gray.600',
                  color: 'gray.300',
                  borderColor: 'gray.400'
                }
              })
        }
      }
    }
  }, [color, isDisabled])

  const handlePointerUp: PointerEventHandler<HTMLButtonElement> = event => {
    if (!isDisabled) {
      globalAudio('click01').play()
      onPointerUp?.(event)
    }
  }

  return (
    <>
      <Button
        h="48px"
        w="48px"
        isDisabled={isDisabled}
        onPointerUp={handlePointerUp}
        borderRadius={4}
        border="1px solid"
        borderBottomWidth="3px"
        {...style}
      >
        {icon}
      </Button>
      {children}
    </>
  )
}
