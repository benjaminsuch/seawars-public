import type { IncomingMessage } from 'http'

import type { IClientWebSocket, RpcWebsocketNamespace } from './NetworkServer'

import logger from '../common/logger'
import { NetworkServer } from './NetworkServer'

/**
 * `NetworkConnection` watches the connection by performing a "heartbeat" via ping/pong
 * messages between the server and client.
 *
 * A heartbeat check makes sure we don't have dead connections and to keep the connection
 * alive from potential server-provider related timeouts (Heroku closes the connection
 * when no messages have been sent within 60 seconds).
 *
 * If we receive no sign of life within `KILL_TIMEOUT_MS`, we terminate the connection
 * from our side.
 */
export class NetworkConnection {
  /**
   * If no message is received from the client within that timeframe, we terminate/kill
   * the connection.
   */
  public static readonly KILL_TIMEOUT_MS = 30000

  /**
   * A list of *every* connection.
   */
  public static readonly connections = new Set<NetworkConnection>()

  public static getConnectionById(id: NetworkConnection['id']) {
    let connection: NetworkConnection | undefined

    this.connections.forEach(item => {
      if (!connection && item.id === id) {
        connection = item
      }
    })

    if (!connection) {
      throw new Error(`Cannot find connection for id "${id}".`)
    }

    return connection
  }

  private _isAlive = true

  get isAlive() {
    return this._isAlive
  }

  set isAlive(val: NetworkConnection['_isAlive']) {
    this._isAlive = val
  }

  private timeout?: NodeJS.Timeout

  private readonly server: NetworkServer

  public readonly id: string

  public readonly socket: IClientWebSocket

  public readonly request: IncomingMessage

  public readonly namespace: RpcWebsocketNamespace

  constructor(
    socket: NetworkConnection['socket'],
    request: NetworkConnection['request']
  ) {
    this.id = socket._id
    this.request = request
    this.socket = socket
    this.server = NetworkServer.instance()

    if (!IS_SERVER) {
      throw new Error(`Only the server can use NetworkConnection.`)
    }

    this.namespace = this.server.of(this.id)
    this.namespace.clients().clients.set(this.id, this.socket)
    this.namespace.event('ping')

    this.ping()
  }

  public registerEvent(name: string) {
    if (!this.namespace.eventList.includes(name)) {
      this.namespace.event(name)
    }
  }

  public close(): void {
    this.isAlive = false
    this.server.closeNamespace(this.id)

    NetworkConnection.connections.delete(this)
  }

  public onPong(): void {
    this.ping()
  }

  private ping(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.close()
      logger.info(`Connection ${this.id} terminated.`)
    }, NetworkConnection.KILL_TIMEOUT_MS)

    this.namespace.emit('ping')
  }
}
