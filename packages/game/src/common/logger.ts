export interface Log<T = unknown> {
  date: string
  tags: Set<string>
  message: string
  details: T
  severity: number
  type: LogType
}

export interface LogConfig extends Pick<Log, 'details' | 'severity'> {
  tags: string[]
  type: LogType
}

export type LogType = 'debug' | 'info' | 'log'

export interface LogFunction {
  (message: Log['message'], config?: Partial<LogConfig>): void
}

export type LogTransport = (log: Log) => unknown

const list: Log[] = []
const transports: LogTransport[] = []

const log: LogFunction = (
  message,
  { details = {}, tags = [], severity = 1, type = 'log' } = {}
) => {
  const length = list.push({
    date: new Date().toISOString(),
    message,
    details,
    tags: new Set(tags),
    type,
    severity
  })

  transports.forEach(transport => transport(list[length - 1]))
}

const registerTransport = (transport: LogTransport) => {
  transports.push(transport)
}

const unregisterTransport = (transport: LogTransport) => {
  const idx = transports.findIndex(item => item === transport)

  if (idx > -1) {
    transports.splice(idx, 1)
  }
}

const debug: LogFunction = (message, options) =>
  log(message, { ...options, type: 'debug' })

const info: LogFunction = (message, options) => log(message, { ...options, type: 'info' })

const logger = {
  debug,
  info,
  log,
  registerTransport,
  unregisterTransport
}

registerTransport(({ message }) => console.log(message))

export default logger
