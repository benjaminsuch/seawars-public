declare global {
  const IS_CLIENT: boolean
  const IS_SERVER: boolean

  namespace NodeJS {
    interface ProcessEnv {
      BUILD_TARGET: 'esm' | 'cjs'
      IS_CLIENT: string
      IS_SERVER: string
    }
  }
}

export {}
