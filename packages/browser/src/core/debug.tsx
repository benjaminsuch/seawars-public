import { ComponentType, forwardRef, PropsWithChildren, VFC } from 'react'

export const isDev = process.env.NODE_ENV === 'development'

export const debug = (message: any, section: string = '', style = '', ...args: any[]) => {
  if (isDev) {
    console.log(
      `%c[${section ? `seawars:${section}` : 'seawars'}] %c${message}`,
      'color: #bada55',
      style,
      ...args
    )
  }
}

export const withDebug = <P extends Record<string, any>>(
  DebugComponent: ComponentType<PropsWithChildren<P>>,
  Component: ComponentType<P>
) => {
  if (!isDev) {
    return Component
  }

  const Wrapper = forwardRef<any, P>((props, ref) => (
    <DebugComponent {...props}>
      <Component ref={ref} {...props} />
    </DebugComponent>
  ))
  Wrapper.displayName = `withDebug(${Component.displayName ?? Component.name})`

  return Wrapper
}
