export default {
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_SERVER: process.env.GAME_BUILD_TYPE === 'server',
  IS_CLIENT:
    process.env.GAME_BUILD_TYPE === 'client' ||
    process.env.NEXT_PUBLIC_GAME_BUILD_TYPE === 'client'
}
