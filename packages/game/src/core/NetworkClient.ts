import * as RpcWebsocket from 'rpc-websockets'

export class NetworkClient extends RpcWebsocket.Client {
  private _isOpen = false

  get isOpen() {
    return this._isOpen
  }

  private static _instance?: NetworkClient

  static readonly PING_INTERVAL_MS = 10000

  static instance() {
    if (!this._instance) {
      throw new Error(
        `No instance of 'NetworkClient' available. Create one with 'new NetworkClient()'.`
      )
    }
    return this._instance
  }

  constructor(address: string) {
    super(address, { autoconnect: false, max_reconnects: 1 })

    if (NetworkClient._instance) {
      throw new Error(
        `An instance already exists. Use 'NetworkClient.instance()' to retrieve it.`
      )
    }

    NetworkClient._instance = this

    this.on('open', () => {
      this._isOpen = true

      this.subscribe('ping')
      this.on('ping', () =>
        setTimeout(() => this.notify('pong'), NetworkClient.PING_INTERVAL_MS)
      )
    })

    this.on('close', () => {
      this._isOpen = false
    })
  }

  async call(method: string, params?: any, timeout?: number, wsOptions?: any) {
    if (this.isOpen) {
      return super.call(method, params, timeout, wsOptions)
    }
  }

  async notify(method: string, params?: any) {
    if (this.isOpen) {
      return super.notify(method, params)
    }
  }
}
