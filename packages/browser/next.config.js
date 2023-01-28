const path = require('path')
const analyze = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = analyze({
  reactStrictMode: true,
  webpack: config => {
    //config.optimization.minimize = false
    config.resolve.alias['@seawars/game'] = path.resolve(
      __dirname,
      '../../node_modules/@seawars/game/build/index.esm.js'
    )
    return config
  }
})
