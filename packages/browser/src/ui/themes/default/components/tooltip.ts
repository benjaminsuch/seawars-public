import { mode, cssVar, SystemStyleFunction } from '@chakra-ui/theme-tools'

const $bg = cssVar('tooltip-bg')
const $arrowBg = cssVar('popper-arrow-bg')

const baseStyle: SystemStyleFunction = props => {
  const bg = mode('gray.500', 'gray.300')(props)

  return {
    [$bg.variable]: `colors.${bg}`,
    bg,
    [$arrowBg.variable]: bg,
    borderRadius: 0,
    fontWeight: 'normal'
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { baseStyle }
