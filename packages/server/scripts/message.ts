import { io } from 'socket.io-client'

const port = process.env.PORT ?? 3021
const socket = io(`http://localhost:${port}`)

const argv = process.argv.slice(2)
const [event, ...args] = argv as Array<string | null>

if (!event) {
  console.log('Please provide an event type.')
  process.exit()
}

try {
  socket.on('connect', () => {
    console.log('Connection established')

    if (!args.length) {
      args.push(null)
    }
    console.log('Send event:', event)
    socket.emit(event, ...args)
    //process.exit()
  })

  socket.on('connect_error', () => {
    console.log('Connection denied by the host.')
    process.exit()
  })
} catch (error) {
  console.log(error)
  process.exit(1)
}
