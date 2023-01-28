import type { Component, ComponentState } from '../core/Component'
import type { GameObject } from '../core/GameObject'
import type { NetworkConnection } from '../core/NetworkConnection'
import type { INetworkIdentity } from '../core/NetworkIdentity'
import type { ClientArg } from '../core/NetworkServer'

import { v4 as uuid } from 'uuid'

import logger from '../common/logger'
import { NetworkComponent } from '../core/NetworkComponent'
import { NetworkIdentity } from '../core/NetworkIdentity'
import { GAMEOBJECT_SPAWN_EVENT } from '../core/NetworkManager'

export interface NetworkUpdateData<S extends ComponentState> {
  id: string
  state?: S
  [key: string]: any
}

export type NetworkObjectState = ComponentState

const withOwner = (clientId: string, gameObject?: GameObject) => {
  const data = gameObject?.toJSON()

  if (data) {
    data.components = data.components?.map(({ ownerId, ...rest }) => ({
      ...rest,
      isOwner: ownerId === clientId
    }))
  }

  return data
}

/**
 * The `NetworkObject` component is some sort of manager, but for a single `GameObject`.
 *
 * Network updates are sent and received here and further delegated to the necessary components.
 * If a gameobject has a `NetworkObject`, it can receive updates for any of it's components and
 * `NetworkObject` will make sure that the state is up to date with the server.
 */
export class NetworkObjectComponent extends NetworkComponent implements INetworkIdentity {
  public static create(data?: Partial<NetworkObjectState>) {
    return new NetworkObjectComponent(uuid(), { isDisabled: false, ...data })
  }

  /**
   * Server only.
   *
   * A set of client id's that listen to events of this game object.
   * It should really just contain those clients, that you want to
   * receive updates.
   */
  //#ifdef IS_SERVER
  public readonly clients = new Set<string>()
  //#endif

  /**
   * Contains all components that inherit from `NetworkComponent`. This property
   * is solvely for convenience to prevent multiple `this.gameObject.components`
   * queries.
   */
  public readonly networkComponents = new Set<NetworkComponent>()

  /**
   * On the server-side it is assigned by the constructor. On the client-side
   * it's the `spawn` method.
   */
  private _networkId?: NetworkIdentity

  get networkId() {
    return this._networkId?.id
  }

  constructor(id: NetworkObjectComponent['id'], state: NetworkObjectState) {
    super({ id, name: 'NetworkObject' }, state)

    this._networkId = new NetworkIdentity(this, id)
  }

  public spawn(networkId?: ClientArg<NetworkObjectComponent['networkId']>): void {
    if (!this.isSpawned) {
      this.networkComponents.forEach(component => component.onSpawn())
      this.setupEventListeners()
    }

    if (IS_CLIENT) {
      if (networkId) {
        this._networkId = new NetworkIdentity(this, networkId)
      }
    }
  }

  public despawn(): void {
    if (this.isSpawned) {
      this.networkComponents.forEach(component => component.onDespawn())
    }
  }

  /**
   * Server only.
   */
  //#ifdef IS_SERVER
  public onSpawnRequest(clientId: NetworkConnection['id']): void {
    const networkManager = this.getNetworkManager()
    const event = `gameObject.${this.gameObject?.id}.update`

    if (!clientId) {
      throw new Error(`Missing value of "clientId". This should not happen.`)
    }

    this.clients.add(clientId)

    // Register the update event of this gameobject for each client
    const client = networkManager.connections.get(clientId)
    client?.registerEvent(event)

    if (this.isSpawned) {
      networkManager.emit(clientId, GAMEOBJECT_SPAWN_EVENT, {
        gameObject: withOwner(clientId, this.gameObject),
        networkId: this.networkId
      })
    }
  }
  //endif

  /**
   * Server only.
   */
  //#ifdef IS_SERVER
  public onClientDisconnected(clientId: NetworkConnection['id']): void {
    // Don't unset `ownerId` here. A client disconnect does not meant he loses
    // the ownership of this gameobject.
    this.clients.delete(clientId)
  }
  //endif

  /**
   * Server only.
   */
  //#ifdef IS_SERVER
  public setOwnerId(ownerId: string): void {
    this.networkComponents.forEach(component => {
      component.ownerId = ownerId
    })
  }
  //endif

  /**
   * Server only.
   */
  //#ifdef IS_SERVER
  public sendUpdate(
    id: NetworkComponent['id'],
    { state, ...rest }: Omit<NetworkUpdateData<ComponentState>, 'id'>
  ): void {
    this.emit(`${this.id}.update`, { id, state, ...rest })
  }
  //#endif

  /**
   * Server only.
   *
   * Shortcut for `this.networkManager.emit`, but emit's the event to *all* `clients`.
   */
  //#ifdef IS_SERVER
  public emit(event: string, data: any): void {
    this.clients.forEach(clientId => {
      logger.debug(`[Emit]: ${event} to ${clientId}`)
      this.networkManager?.emit(clientId, event, data)
    })
  }
  //#endif

  private setupEventListeners(): void {
    const UPDATE_EVENT = `${this.id}.update`
    const OWNERSHIP_RECEIVED_EVENT = `${this.id}.ownership-received`
    const OWNERSHIP_LOST_EVENT = `${this.id}.ownership-lost`

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      const server = this.getNetworkManager().getServer()

      server.event(UPDATE_EVENT)
      server.event(OWNERSHIP_RECEIVED_EVENT)
      server.event(OWNERSHIP_LOST_EVENT)
    }
    //#endif

    //#ifdef IS_CLIENT
    if (IS_CLIENT) {
      const client = this.getNetworkManager().getClient()

      client.subscribe(UPDATE_EVENT)
      client.on(UPDATE_EVENT, this.onServerUpdate.bind(this))

      client.subscribe(OWNERSHIP_RECEIVED_EVENT)
      client.on(OWNERSHIP_RECEIVED_EVENT, this.invokeOnOwnershipReceived.bind(this))

      client.subscribe(OWNERSHIP_LOST_EVENT)
      client.on(OWNERSHIP_LOST_EVENT, this.invokeOnOwnershipLost.bind(this))
    }
    //#endif
  }

  /**
   * Client only.
   *
   * Updates the state of component with the id of `event.id`. It doesn't matter
   * if the component is an instance of `NetworkComponent` or not.
   */
  //#ifdef IS_CLIENT
  private onServerUpdate(event: NetworkUpdateData<ComponentState>): void {
    const { id, state, ...rest } = event
    this.gameObject.getComponentById(id)?.store.setState(state)

    for (const [key, val] of Object.entries(rest)) {
      //TODO: Apply key/val to component (but not sure if this is a good idea)
    }
  }
  //#endif

  //#ifdef IS_CLIENT
  private invokeOnOwnershipReceived(): void {
    this.networkComponents.forEach(component => {
      component.onOwnershipReceived()
    })
  }
  //#endif

  //#ifdef IS_CLIENT
  private invokeOnOwnershipLost(): void {
    this.networkComponents.forEach(component => {
      component.onOwnershipLost()
    })
  }
  //#endif

  //#ifdef IS_SERVER
  private onAnyComponentStoreUpdate(
    component: Component<any>,
    state: ComponentState
  ): void {
    this.sendUpdate(component.id, { state })
  }
  //#endif

  protected onGameObjectReady(): void {
    super.onGameObjectReady()

    for (const component of this.gameObject.getComponentList()) {
      if (component instanceof NetworkComponent) {
        this.networkComponents.add(component)
      }

      //#ifdef IS_SERVER
      if (IS_SERVER) {
        if (component.id !== this.id) {
          component.store.subscribe(state =>
            this.onAnyComponentStoreUpdate(component, state)
          )
        }
      }
      //#endif
    }
  }

  //TODO: Send "despawn" event to all relevant clients.
  protected onGameObjectDestroyed() {}
}
