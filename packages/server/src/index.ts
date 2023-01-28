import chalk from 'chalk'
import * as seawars from '@seawars/game'

const port = Number(process.env.PORT ?? 8080)
const server = new seawars.NetworkServer({ port, host: '0.0.0.0' })

server.on('listening', () => {
  console.log(`App is running on port: ${chalk.yellow(port)}`)
})

server.on('close', () => {
  console.log('Server closed. Connections are being dissolved')
})

server.on('connection', (socket: seawars.NetworkConnection['socket']) => {
  console.log(`Client ${socket._id} connected`)
})

server.on('disconnection', (socket: seawars.NetworkConnection['socket']) => {
  console.log(`Client ${socket._id} disconnected`)
})
