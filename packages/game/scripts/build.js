const { build } = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')
const ifdef = require('./plugins/esbuild-plugin-ifdef')

const { BUILD_TARGET = 'esm', GAME_BUILD_TYPE = 'client', NODE_ENV } = process.env

let fileExt = '.esm'
let tsconfig = ''

if (BUILD_TARGET === 'cjs') {
  fileExt = '.cjs'
  tsconfig = '.cjs'
}

const define = {
  IS_CLIENT: String(GAME_BUILD_TYPE === 'client'),
  IS_SERVER: String(GAME_BUILD_TYPE === 'server')
}
const plugins = [nodeExternalsPlugin(), ifdef(define, process.cwd() + '/src')]

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  keepNames: true,
  minify: NODE_ENV === 'production',
  platform: 'node',
  sourcemap: true,
  outfile: `build/index${fileExt}.js`,
  tsconfig: `tsconfig${tsconfig}.json`,
  define,
  plugins
}).catch(error => {
  console.log(error)
  process.exit(1)
})
