import { mode, SystemStyleFunction } from '@chakra-ui/theme-tools'

type AccessibleColor = {
  bg?: string
  color?: string
  hoverBg?: string
  activeBg?: string
}

const baseStyle = {
  borderRadius: 0,
  textTransform: 'uppercase'
}

const accessibleColorMap: { [key: string]: AccessibleColor } = {
  blackAlpha: {
    bg: 'blackAlpha.600',
    color: 'white',
    hoverBg: 'blackAlpha.700',
    activeBg: 'blackAlpha.800'
  },
  whiteAlpha: {
    bg: 'whiteAlpha.500',
    color: 'white',
    hoverBg: 'whiteAlpha.700',
    activeBg: 'whiteAlpha.800'
  },
  yellow: {
    bg: 'yellow.300',
    color: 'black',
    hoverBg: 'yellow.400',
    activeBg: 'yellow.500'
  },
  cyan: {
    bg: 'cyan.400',
    color: 'black',
    hoverBg: 'cyan.500',
    activeBg: 'cyan.600'
  }
}

const variantSolid: SystemStyleFunction = props => {
  const { colorScheme: c } = props

  if (c === 'gray') {
    const bg = mode(`gray.100`, `whiteAlpha.200`)(props)

    return {
      bg,
      _hover: {
        bg: mode(`gray.200`, `whiteAlpha.300`)(props),
        _disabled: {
          bg
        }
      },
      _active: { bg: mode(`gray.300`, `whiteAlpha.400`)(props) }
    }
  }

  const {
    bg = `${c}.400`,
    color = 'white',
    hoverBg = `${c}.600`,
    activeBg = `${c}.700`
  } = accessibleColorMap[c] ?? {}

  const background = mode(bg, `${c}.200`)(props)

  return {
    bg: background,
    color: mode(color, `gray.800`)(props),
    _hover: {
      bg: mode(hoverBg, `${c}.300`)(props),
      _disabled: {
        bg: background
      }
    },
    _active: { bg: mode(activeBg, `${c}.400`)(props) }
  }
}

const variants = {
  solid: variantSolid
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { baseStyle, variants }
