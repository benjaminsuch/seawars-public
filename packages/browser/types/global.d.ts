declare global {
  namespace JSX {
    interface IntrinsicElements {
      water: Object3DNode<Water, typeof Water>
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      GAME_BUILD_TYPE: string
      NEXT_PUBLIC_GAME_BUILD_TYPE: string
      NEXT_PUBLIC_WEBSOCKET: string
    }
  }
}
