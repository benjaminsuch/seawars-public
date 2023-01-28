import type { NetworkObjectComponent } from '../components/NetworkObject'
import type { ComponentData, ComponentState } from './Component'
import type { NetworkManager } from './NetworkManager'

import { Component } from './Component'
import { GameError } from './GameError'

export type CurriedNetworkComponent<C> = {
  [P in keyof C]: C[P] extends (...p: infer P) => unknown ? (...p: P) => unknown : C[P]
}

export type TNetworkComponentClass = NetworkComponent<ComponentState>

/**
 * Components that inherit from `NetworkComponent` will be able to send
 * Remote Procedure Calls (RPC's) and will receive events for ownerships.
 *
 * It also gives access to the NetworkManager and props for the most common
 * information (isOwner, isSpawned etc.)/
 */
export class NetworkComponent<
  State extends ComponentState = any
> extends Component<State> {
  /**
   * Client only.
   *
   * Gets wheter or not the gameobject is controlled by the player.
   */
  //#ifdef IS_CLIENT
  private _isOwner = false

  get isOwner() {
    return this._isOwner
  }

  set isOwner(val: NetworkComponent['_isOwner']) {
    this._isOwner = val
  }
  //#endif

  private _isSpawned = false

  get isSpawned() {
    return this._isSpawned
  }

  /**
   * Server only.
   *
   * Contains the owner's Client Id.
   */
  //#ifdef IS_SERVER
  private _ownerId?: string | null

  get ownerId() {
    return this._ownerId
  }

  set ownerId(val: NetworkComponent['_ownerId']) {
    if (!IS_SERVER) {
      throw new GameError(
        `NetworkComponent: Only the server is allowed to set the variable.`
      )
    }

    this._ownerId = val
  }
  //#endif

  /**
   * If you require `networkManager` to have been set, use `getNetworkManager` instead.
   */
  private _networkManager?: NetworkManager

  get networkManager() {
    return this._networkManager
  }

  set networkManager(val: NetworkManager | undefined) {
    if (!val) {
      throw new GameError(
        `NetworkComponent: You cannot remove the network manager. Why would you do that?`
      )
    }

    this._networkManager = val
    this.onNetworkManagerReceived()
  }

  /**
   * Server only.
   *
   * Marks changes to the state of `this.store`. Will be set to `false` as soon as
   *
   */
  //#ifdef IS_SERVER
  private _isDirty = false

  get isDirty() {
    return this._isDirty
  }
  //#endif

  constructor(data: ComponentData, state: State) {
    super(data, state)
  }

  public onSpawn(): void {
    this._isSpawned = true
  }

  public onDespawn(): void {}

  /**
   * Client only.
   */
  //#ifdef IS_CLIENT
  public onServerError(error: unknown): void {
    console.log('RPC error', error)
  }
  //#endif

  public onOwnershipLost(): void {
    if (IS_SERVER) {
      //
    }
    if (IS_CLIENT) {
      this._isOwner = true
    }
  }

  public onOwnershipReceived(): void {
    if (IS_SERVER) {
      //
    }
    if (IS_CLIENT) {
      this._isOwner = false
    }
  }

  public toJSON(): any {
    if (IS_SERVER) {
      return {
        ...super.toJSON(),
        ownerId: this.ownerId
      }
    }

    if (IS_CLIENT) {
      return {
        ...super.toJSON(),
        isOwner: this.isOwner
      }
    }
  }

  public getNetworkObject(): NetworkObjectComponent {
    return this.getNetworkManager().gameObjects.getNetworkObject(this.gameObject)
  }

  protected getNetworkManager(): NetworkManager {
    if (!this.networkManager) {
      throw new GameError(`NetworkComponent: An instance of "NetworkManager" is missing.`)
    }
    return this.networkManager
  }

  /**
   * When a NetworkComponent is instantiated it does not have the NetworkManager assigned.
   */
  protected onNetworkManagerReceived(): void {}
}
