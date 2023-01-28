import { extendTheme } from '@chakra-ui/react'

import components from './components'
import foundations from './foundations'
import styles from './styles'

const config = {
  ...foundations,
  components,
  styles,
  fonts: {
    heading: 'Saira',
    body: 'Saira'
  },
  shadows: {
    outline: 'none'
  }
}

export { default as fonts } from './fonts'

export const theme = extendTheme(config)
