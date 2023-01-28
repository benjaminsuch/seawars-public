import * as RpcWebsocket from 'rpc-websockets'
import chalk from 'chalk'
import { ServerOptions, WebSocket } from 'ws'

import logger from '../common/logger'
import { DecoratorFunction } from '../types'
import { NetworkClient } from './NetworkClient'
import { NetworkConnection } from './NetworkConnection'
import { NetworkIdentity } from './NetworkIdentity'

export interface RpcWebsocketEvent {
  public: () => void
  protected: () => void
}

export interface RpcWebsocketMethod {
  public: () => void
  protected: () => void
}

export interface RpcWebsocketParams {
  [x: string]: any
}

export type RpcHandler = (
  params: RpcWebsocketParams,
  socketId: string
) => RpcWebsocketMethod | Promise<void | unknown> | void | unknown

export interface RpcWebsocketNamespace {
  clients: () => { clients: Map<string, unknown>; events: Record<string, unknown> }
  connected: () => Record<string, unknown>
  emit: (event: string, ...params: any[]) => void
  event: (name: string) => RpcWebsocketEvent
  readonly eventList: string[]
  readonly name: string
  register: (
    name: string,
    callback: (params: RpcWebsocketParams) => void
  ) => RpcWebsocketMethod
}

export interface IClientWebSocket extends WebSocket {
  _id: string
  _authenticated: boolean
}

//TODO: Remove `MockServer`
export class NetworkServer extends (RpcWebsocket.Server ?? class MockServer {}) {
  private static _instance?: NetworkServer

  public static readonly SOCKET_TIMEOUT_MS = 30000

  public static instance() {
    if (!this._instance) {
      throw new Error(
        `No instance of 'NetworkServer' available. Create one with 'new NetworkServer()'.`
      )
    }
    return this._instance
  }

  private static readonly _handlers = new Map<string, RpcHandler>()

  public static registerRpcHandler(name: string, handler: RpcHandler) {
    if (this._handlers.has(name)) {
      console.warn(`RPC handler with name "${name}" already exists.`)
      return
    }
    this._handlers.set(name, handler)
  }

  constructor(options: ServerOptions) {
    super(options)

    if (NetworkServer._instance) {
      throw new Error(
        `An instance already exists. Use 'NetworkServer.instance()' to retrieve it.`
      )
    }

    NetworkServer._instance = this

    this.on('connection', (socket, request) => this.onConnection(socket, request))
    this.on('disconnection', socket => this.onDisconnection(socket))
    this.on('close', () => this.onClose())

    this.register('pong', (_, socketId) => this.onPong(socketId))
    NetworkServer._handlers.forEach((handler, key) => this.register(key, handler))
  }

  //TODO: Output log message
  public register(
    name: string,
    handler: (params: RpcWebsocketParams, socketId: string) => void,
    namespace = '/'
  ): RpcWebsocketMethod {
    return super.register(name, handler, namespace)
  }

  private onConnection(
    socket: NetworkConnection['socket'],
    request: NetworkConnection['request']
  ) {
    NetworkConnection.connections.add(new NetworkConnection(socket, request))
  }

  private onDisconnection(socket: NetworkConnection['socket']) {
    NetworkConnection.getConnectionById(socket._id).close()
  }

  private onClose() {
    NetworkConnection.connections.forEach(connection => connection.close())
  }

  private onPong(socketId: NetworkConnection['id']) {
    NetworkConnection.getConnectionById(socketId).onPong()
  }
}

export type ClientArg<T> = T

export type ServerArg<T> = T

export type ClientRes<T> = T

export type ServerRes<T> = T

export interface ServerRpcOptions {
  requireOwnership?: boolean
  type?: 'call' | 'notify'
}

const defaultServerRpcOptions: ServerRpcOptions = {
  requireOwnership: false,
  type: 'call'
}

/**
 * __On client-side:__
 *
 * The original method will be stored in a variable and then overridden by a function
 * that makes the RPC call to the server and wraps it with a try/catch block.
 *
 * The RPC response will be passed to the original method as it's first argument.
 *
 * __Important__: The response will *replace* the original first argument and will most
 * likely also have a different type!
 *
 * Let's take `Match.load` as an example, which you call it with `Match.load('fj6h5sP')`.
 * ServerRpc will override `load`, sends an RPC call to `Match.load` with all it's
 * arguments as parameters and finally calls the original method.
 *
 * The response from the RPC (Match.load) will be passed to the original method:
 * `return originalMethod.apply(target, [response])`
 *
 * You see, when we initially called `Match.load`, it expected a string as the first argument.
 * Now it's an object from type `MatchData`. This is important when you implement logic
 * inside `Match.load`.
 *
 * Every argument use in your initial method call will be passed to the __wrapper__ function!
 *
 * __On server-side:__
 *
 * Registers an RPC handler under the name of the method that invoked the RPC call.
 * The RPC handler is a small function that calls the original method with all
 * arguments sent via params (`params.args`) and will pass the `socketId` as last
 * argument.
 *
 * Every error that originates from the original method will be caught and handled1
 * automatically.
 *
 * @param {ServerRpcOptions=} options
 */
export const ServerRpc = (options?: ServerRpcOptions): DecoratorFunction => {
  const { type } = { ...defaultServerRpcOptions, ...options }

  /**
   * @param target - The class in which the decorator is being used.
   * @param prop - The method that is being decorated.
   * @param descriptor - An object that holds implementation details of `prop`.
   */
  return (target, prop, descriptor) => {
    const className = target.name ?? target.constructor.name
    const name = `${className}.${descriptor.value.name}`
    const originalMethod = descriptor.value as unknown as (...args: unknown[]) => unknown

    if (typeof target[prop] !== 'function') {
      return
    }

    if (IS_CLIENT) {
      descriptor.value = async function RpcCaller(...args: unknown[]) {
        const networkId = (this as typeof target).networkId

        // If true, `this` is the class itself, means a static method has been called.
        if (this !== target) {
          if (!networkId) {
            console.error(
              `Cannot use 'ServerRpc'. ${className} does not implement 'INetworkIdentity'.`
            )
            return
          }
        }

        const client = NetworkClient.instance()
        const rpc = type === 'call' ? client.call : client.notify

        try {
          // rpc-websockets expects an object for JSON 2.0 compatibility, which is why
          // we send args via `{ args }` instead of just `args`.
          //* In development, HMR will cause rpc's to fire even though our websocket connection is not open/ready yet.
          //* I'm not sure if that can happen in product (I don't think so), but we certainly should observe the
          //* behavior when the connection is lost (a connection-loss that has not been caused by a reload).
          //TODO: We could implement a queue that stores all rpc calls that couldn't be sent due to connection issues.
          //TODO: The queue will be cleared via FIFO once the connection is up again.
          const response = await rpc.apply(client, [name, { args, networkId }])
          // Again: Notice the change of arguments (`response` replaces the initial arg).
          return originalMethod.apply(this, [response])
        } catch (error) {
          console.log('RPC Error', error)
        }
      }
    }

    // We have to differentiate between static and non-static methods.
    // Since static methods are "global", means they are the same across all instances
    // of that class, we can just call `originalMethod` on `target`.
    //
    // If the method belongs to an instance though, we have to identify the instance
    // before we invoke the method. The identification is done via `networkId`.
    if (IS_SERVER) {
      logger.debug(chalk.gray`Registering ${name}`)

      NetworkServer.registerRpcHandler(
        name,
        async ({ args, networkId }, socketId: string) => {
          logger.debug(chalk.blueBright`${name} called by ${socketId}`)

          const instance = networkId ? NetworkIdentity.getByNetworkId(networkId) : target

          if (networkId && !instance) {
            throw new Error(
              `A 'networkId' was provided, but it's instance couldn't be found.`
            )
          }

          // Some RPC's work with data that is passed to them via `params`. But some RPC's
          // don't accept any arguments. These RPC's would have `socketId` as their first
          // argument, which can be confusing.
          //
          // Take `Match.create` as an example. You call it one the client-side via `Match.create()`
          // without any arguments. It will be called on the server and the server respond
          // with data. This data is then passed as first argument to the implementation
          // of `Match.create`.
          //
          // `undefined` here, acts as a placeholder, so both server and client are both
          // working with the same amount of arguments. I hope that's not too confusing.
          if (!args.length) {
            args.push(undefined)
          }

          try {
            return originalMethod.apply(instance, [...args, socketId])
          } catch (error) {
            console.error(error)

            if (error instanceof Error) {
              return NetworkServer.instance().createError(3000, error.message, {})
            }
          }
        }
      )
    }
  }
}
