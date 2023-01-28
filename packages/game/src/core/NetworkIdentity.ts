import { v4 as uuid } from 'uuid'

export interface INetworkIdentity {
  networkId: NetworkIdentity['id']
}

/**
 * This class is used to identify _instances_ across the network.
 */
export class NetworkIdentity {
  private _id?: string

  get id() {
    return this._id
  }

  set id(val) {
    if (!IS_CLIENT) {
      throw new Error(`Only the client can set the network id.`)
    }

    if (this._id) {
      console.warn(`This instance already has a network id assigned.`)
      return
    }

    this._id = val
  }

  //TODO: Automatically remove instances that are not needed anymore
  private static readonly _instancesByNetworkId = new Map<
    NetworkIdentity['_id'],
    NetworkIdentity
  >()

  static getByNetworkId(id: NetworkIdentity['_id']) {
    return this._instancesByNetworkId.get(id)
  }

  //? Can this be done better by using a decorator?
  constructor(instance: any, networkId?: string) {
    if (IS_SERVER) {
      this._id = networkId ?? uuid()
    }

    if (IS_CLIENT) {
      this._id = networkId
    }

    NetworkIdentity._instancesByNetworkId.set(this._id, instance)
  }
}
