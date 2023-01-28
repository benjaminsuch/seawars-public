import type { INetworkIdentity } from '../../core/NetworkIdentity'
import type { ClientArg, ServerArg } from '../../core/NetworkServer'

import { v4 as uuid } from 'uuid'

import { NetworkConnection } from '../../core/NetworkConnection'
import { NetworkIdentity } from '../../core/NetworkIdentity'
import { ServerRpc } from '../../core/NetworkServer'

export interface UserData {
  id: string
}

export interface UserRegisterParams {
  name: string
  email: string
}

export class User implements INetworkIdentity {
  public static readonly users = new Set<User>()

  public static readonly usersByUserId = new Map<User['id'], User>()

  public static readonly usersByConnectionId = new Map<NetworkConnection['id'], User>()

  public static getUserByUserId(id: User['id']) {
    const user = this.usersByUserId.get(id)

    if (!user) {
      throw new Error(`No user found with id "${id}".`)
    }

    return user
  }

  public static getUserByConnectionId(id: NetworkConnection['id']) {
    const user = this.usersByConnectionId.get(id)

    if (!user) {
      throw new Error(`No user found for client id "${id}".`)
    }

    return user
  }

  @ServerRpc()
  public static async register(
    data?: ServerArg<UserRegisterParams> | ClientArg<UserData>,
    clientId = ''
  ) {
    //#ifdef IS_SERVER
    if (IS_SERVER) {
      const connection = NetworkConnection.getConnectionById(clientId)
      const user = new User(uuid(), connection)

      this.users.add(user)
      this.usersByUserId.set(user.id, user)
      this.usersByConnectionId.set(connection.id, user)

      return user
    }
    //#endif

    return data as UserData
  }

  @ServerRpc()
  public static async acknowledge(
    userOrId: ServerArg<User['id']> | ClientArg<User>,
    clientId = ''
  ) {
    //#ifdef IS_SERVER
    if (IS_SERVER) {
      const id = userOrId as User['id']
      const connection = NetworkConnection.getConnectionById(clientId)
      const user = User.usersByUserId.get(id)

      if (!user) {
        return this.register(undefined, clientId)
      }

      user._previousConnection = user._activeConnection
      user._activeConnection = connection
      user.connections.add(connection)
      this.usersByConnectionId.set(connection.id, user)

      return user
    }
    //#endif

    return userOrId as UserData
  }

  public static remove(user: User) {
    this.users.delete(user)
    this.usersByUserId.delete(user.id)
    user.connections.forEach(connection => this.usersByConnectionId.delete(connection.id))
  }

  private readonly _networkId: NetworkIdentity

  get networkId() {
    return this._networkId.id
  }

  private _previousConnection?: NetworkConnection

  get previousConnection() {
    return this._previousConnection
  }

  private _activeConnection: NetworkConnection

  get activeConnection() {
    return this._activeConnection
  }

  public readonly id: UserData['id']

  public readonly connections = new Set<NetworkConnection>()

  constructor(id: User['id'], connection: NetworkConnection) {
    if (!IS_SERVER) {
      throw new Error(`Only the server can use User.`)
    }

    this._networkId = new NetworkIdentity(this)
    this._activeConnection = connection

    this.id = id
    this.connections.add(connection)
  }

  public destroy() {
    User.users.delete(this)
    User.usersByUserId.delete(this.id)

    this.connections.forEach(connection => {
      User.usersByConnectionId.delete(connection.id)
    })
  }

  public toJSON(): UserData {
    return { id: this.id }
  }
}
