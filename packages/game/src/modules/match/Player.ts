import type { StoreApi } from 'zustand'

import type { EventDispatcherEvent } from '../../core/EventDispatcher'
import type { INetworkIdentity } from '../../core/NetworkIdentity'
import type { Match } from '../match'

import createStore from 'zustand/vanilla'
import { v4 as uuid } from 'uuid'

import { EventDispatcher } from '../../core/EventDispatcher'
import { NetworkIdentity } from '../../core/NetworkIdentity'
import { ServerRpc } from '../../core/NetworkServer'
import { User } from '../user'

export type PlayerReadyEvent = EventDispatcherEvent<'player.ready', { player: Player }>

export type PlayerUnreadyEvent = EventDispatcherEvent<
  'player.unready',
  { player: Player }
>

export enum PlayerColors {
  Blue = '#1f64c4',
  Green = '#14b34e',
  Red = '#d43c37',
  Purple = '#8b18c9'
}

export interface PlayerStore {
  color: PlayerColors
  isOnline?: boolean
  isReady?: boolean
  position: number
  score: number
}

export interface PlayerData {
  id: string
  isHost: boolean
  name: string
  store: PlayerStore
}

export class Player extends EventDispatcher implements INetworkIdentity {
  public static create(data?: Partial<PlayerData>): PlayerData {
    return {
      id: uuid(),
      isHost: false,
      name: 'Player 1',
      ...data,
      store: {
        color: PlayerColors.Red,
        position: 0,
        isReady: false,
        score: 0,
        ...data?.store
      }
    }
  }

  private readonly _networkId: NetworkIdentity

  get networkId() {
    return this._networkId.id
  }

  public readonly store: StoreApi<PlayerStore>

  public readonly id: PlayerData['id']

  public readonly isHost: PlayerData['isHost']

  public readonly match: Match

  public readonly name: PlayerData['name']

  public user?: User

  constructor(match: Match, data: PlayerData) {
    super()

    const { id, isHost, name, store } = data

    this._networkId = new NetworkIdentity(this, id)

    this.id = id
    this.isHost = isHost
    this.match = match
    this.name = name

    this.store = createStore<PlayerStore>(() => store)
    this.store.subscribe(this.onStoreUpdate.bind(this))

    if (IS_SERVER) {
      const server = match.networkManager.getServer()

      this.user = User.getUserByUserId(id)
      this.store.setState({ isOnline: this.user.activeConnection.isAlive })

      server.on('disconnection', socket => this.onDisconnection(socket._id))
    }

    if (IS_CLIENT) {
      const client = match.networkManager.getClient()

      client.subscribe(`player.${this.id}.update`)
      client.on(`player.${this.id}.update`, this.onNetworkUpdate.bind(this))
    }
  }

  @ServerRpc({ type: 'notify' })
  public ready(): void {
    this.store.setState({ isReady: true })
    this.dispatchEvent<PlayerReadyEvent>('player.ready', { player: this })
  }

  @ServerRpc({ type: 'notify' })
  public unready(): void {
    this.store.setState({ isReady: false })
    this.dispatchEvent<PlayerUnreadyEvent>('player.unready', { player: this })
  }

  public toJSON(): PlayerData {
    return {
      id: this.id,
      isHost: this.isHost,
      name: this.name,
      store: this.store.getState()
    }
  }

  private sendUpdate(data: Partial<PlayerData> = this.toJSON()): void {
    this.match.networkManager.connections.send(`player.${this.id}.update`, data)
  }

  private onDisconnection(clientId: NetworkIdentity['id']): void {
    if (clientId === this.user?.activeConnection.id) {
      this.store.setState({ isOnline: false })
    }
  }

  private onNetworkUpdate({ store, ...data }: Partial<PlayerData>): void {
    Object.entries(data).forEach(([key, val]) => {
      this[key] = val
    })

    if (store) {
      this.store.setState(store)
    }
  }

  private onStoreUpdate(store: PlayerStore): void {
    if (IS_SERVER) {
      this.sendUpdate({ store })
    }
  }
}
