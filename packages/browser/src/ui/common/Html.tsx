import { ComponentType, FC, VFC } from 'react'
import { toCSSVar } from '@chakra-ui/styled-system'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { Html as BaseHtml } from '@react-three/drei'

import { theme } from '../themes/default'

export interface HtmlProps {
  center?: boolean
  distanceFactor?: number
  zIndexRange?: [number, number]
}

export const Html: FC<HtmlProps> = ({ children, ...props }) => (
  <BaseHtml {...props}>
    <EmotionThemeProvider theme={toCSSVar(theme)}>{children}</EmotionThemeProvider>
  </BaseHtml>
)

export const withHtml = <P extends Record<string, any>>(Component: ComponentType<P>) => {
  const Wrapper: VFC<P & { htmlProps?: HtmlProps }> = ({ htmlProps, ...props }) => (
    <Html>
      <Component {...(props as P)} />
    </Html>
  )
  Wrapper.displayName = `withHtml(${Component.displayName ?? Component.name})`

  return Wrapper
}
