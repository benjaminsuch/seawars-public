import type { NetworkObjectComponent } from '../components/NetworkObject'
import type { Component } from './Component'
import type { GameObjectData } from './GameObject'
import type { NetworkIdentity } from './NetworkIdentity'

import chalk from 'chalk'

import logger from '../common/logger'
import { getComponentClassByName } from '../components'
import { Game } from './Game'
import { GameObject } from './GameObject'
import { GameObjectRegistry } from './GameObjectRegistry'
import { NetworkClient } from './NetworkClient'
import { NetworkComponent } from './NetworkComponent'
import { NetworkConnection } from './NetworkConnection'
import { NetworkServer } from './NetworkServer'

export const GAMEOBJECT_SPAWN_EVENT = 'gameObject.spawn'
export const GAMEOBJECT_DESPAWN_EVENT = 'gameObject.despawn'

class NetworkConnectionList extends Map<NetworkConnection['id'], NetworkConnection> {
  public send(event: string, ...params: unknown[]) {
    this.forEach(connection => {
      logger.debug(
        `[NetworkConnection] Sending: ${chalk.yellow(event)} to ${connection.id}`
      )
      connection.namespace.emit(event, ...params)
    })
  }
}

/**
 * A class that manages all gameobjects that have `NetworkObject` in their components.
 * It also manages the connected clients and the messages between them and the server.
 *
 * How does it "manage" the gameobjects?
 *
 * **Note**: Every instance of `Game` should have only **ONE** instance of NetworkManager.
 */
export class NetworkManager {
  private readonly client?: NetworkClient

  private readonly server?: NetworkServer

  public readonly game: Game

  /**
   * Server:
   * Contains only `GameObjects` that have `NetworkObject` in their components.
   *
   * Client:
   * Contains only spawned `GameObjects`.
   */
  public readonly gameObjects: NetworkGameObjectRegistry

  /**
   * A list of connections managed by `NetworkManager`.
   */
  public readonly connections = new NetworkConnectionList()

  constructor(game: Game, clientOrServer: NetworkClient | NetworkServer) {
    this.game = game
    this.gameObjects = new NetworkGameObjectRegistry(game)

    if (clientOrServer instanceof NetworkServer) {
      this.server = clientOrServer
      this.server.on('disconnection', socket => this.onClientDisconnected(socket._id))
    }

    if (clientOrServer instanceof NetworkClient) {
      this.game = Game.instance()
      this.client = clientOrServer

      this.client.subscribe(GAMEOBJECT_SPAWN_EVENT)
      this.client.on(GAMEOBJECT_SPAWN_EVENT, ({ gameObject, networkId }) =>
        this.onSpawn(gameObject, networkId)
      )

      this.client.subscribe(GAMEOBJECT_DESPAWN_EVENT)
      this.client.on(GAMEOBJECT_DESPAWN_EVENT, () => this.onDespawn())
    }
  }

  //#ifdef IS_CLIENT
  public getClient() {
    if (!this.client) {
      throw new Error(`Please make sure an instance of "NetworkClient" is running.`)
    }
    return this.client
  }
  //#endif

  /**
   * Server only.
   */
  //#ifdef IS_SERVER
  public getConnection(id: NetworkConnection['id']) {
    const connection = this.connections.get(id)

    if (!connection) {
      throw new Error(`No client connected with id "${id}".`)
    }

    return connection
  }
  //#endif

  //#ifdef IS_SERVER
  public getServer() {
    if (!this.server) {
      throw `Please make sure an instance of "NetworkServer" is running.`
    }
    return this.server
  }
  //#endif

  //#ifdef IS_SERVER
  public registerClientId(id: NetworkConnection['id']) {
    if (this.connections.has(id)) {
      console.debug(
        `NetworkManager: Client with id "${id}" already registered, ` +
          `skipping registration of gameobject events.`
      )
      return
    }

    const connection = NetworkConnection.getConnectionById(id)
    connection.registerEvent(GAMEOBJECT_SPAWN_EVENT)
    connection.registerEvent(GAMEOBJECT_DESPAWN_EVENT)

    this.connections.set(connection.id, connection)
  }
  //#endif

  //#ifdef IS_SERVER
  public unregisterClientId(id: NetworkConnection['id']) {
    if (!this.connections.has(id)) {
      console.debug(`NetworkManager: Client with id "${id}" does not exist.`)
      return
    }

    this.connections.delete(id)
  }
  //#endif

  /**
   * Server only.
   *
   * Emit's an event to all clients or a single client, if `clientId` is provided.
   *
   * @param id - Client Id.
   * @param event - Name of the event.
   * @param data - If a `toJSON` function is available, it will be called and that return value will be used.
   */
  //#ifdef IS_SERVER
  public emit(id: NetworkConnection['id'] | null, event: string, data?: unknown) {
    if (id) {
      this.getConnection(id).namespace.emit(event, data)
    } else {
      this.getServer().emit(event, data)
    }
  }
  //#endif

  /**
   * Assigns the current instance of `NetworkManager` to each `GameObject` and registers
   * it in the registry.
   *
   * @param gameObjects - A list of gameobjects.
   */
  public registerGameObjects(gameObjects: GameObject[]) {
    gameObjects
      .filter(gameObject => gameObject.components.has('NetworkObject'))
      .forEach(gameObject => {
        gameObject.getComponentList().forEach(component => {
          if (component instanceof NetworkComponent) {
            component.networkManager = this
          }
        })

        this.registerGameObjects(gameObject.children)
        this.gameObjects.register(gameObject)
      })
  }

  /**
   * Client only.
   *
   * Gets executed everytime we receive a `gameObject.spawn` event.
   *
   * @param data The json data of the gameobject that needs to be spawned.
   */
  private onSpawn(data: GameObjectData, networkId: NetworkIdentity['id']) {
    const [gameObject] = this.gameObjects.resolveGameObjects([data])

    this.registerGameObjects([gameObject])
    this.gameObjects.getNetworkObject(gameObject).spawn(networkId)
  }

  private onDespawn() {
    const networkObjects = this.gameObjects
      .getList()
      .map(this.gameObjects.getNetworkObject)

    for (const networkObject of networkObjects) {
      networkObject.despawn()
    }
  }

  /**
   * Server only.
   *
   * This event on the other hand is listening to the server's `on('disconnection')`
   * event as it makes sense. When a client disconnects from the server, we want to
   * potentially remove him from the `connectedClients` list.
   */
  //#ifdef IS_SERVER
  private onClientDisconnected(id: NetworkConnection['id']) {
    this.connections.delete(id)

    const networkObjects = this.gameObjects
      .getList()
      .map(this.gameObjects.getNetworkObject)

    for (const networkObject of networkObjects) {
      networkObject.onClientDisconnected(id)
    }
  }
  //#endif
}

class NetworkGameObjectRegistry extends GameObjectRegistry {
  private readonly game: Game

  constructor(game: Game) {
    super()

    this.game = game
  }

  /**
   * Server only.
   *
   * Spawns all on the server.
   */
  //#ifdef IS_SERVER
  public spawn(): void {
    for (const gameObject of this.getList()) {
      this.getNetworkObject(gameObject)?.spawn()
    }
  }
  //#endif

  /**
   * Spawn requests usually come from the client.
   */
  public requestSpawn(id: NetworkConnection['id']): void {
    for (const gameObject of this.getList()) {
      this.getNetworkObject(gameObject)?.onSpawnRequest(id)
    }
  }

  public updateOwnerships(
    previousId: NetworkConnection['id'],
    nextId: NetworkConnection['id']
  ): void {
    for (const gameObject of this.getList()) {
      const networkObject = this.getNetworkObject(gameObject)

      if (networkObject.ownerId === previousId) {
        networkObject.setOwnerId(nextId)
      }
    }
  }

  public onClientDisconnected(id: NetworkConnection['id']): void {
    for (const gameObject of this.getList()) {
      this.getNetworkObject(gameObject)?.onClientDisconnected(id)
    }
  }

  public getNetworkObject(gameObject: GameObject): NetworkObjectComponent {
    const networkObject = gameObject.getComponent<NetworkObjectComponent>('NetworkObject')

    if (!networkObject) {
      throw new Error(
        `GameObject ${gameObject.id} does not have component "NetworkObject".`
      )
    }

    return networkObject
  }

  public resolveGameObjects(gameObjects: GameObjectData[]): GameObject[] {
    const resolved: GameObject[] = []

    for (const { id, components = [], parent, label, tags } of gameObjects) {
      resolved.push(
        new GameObject(
          this.game,
          { id, label, parent, tags, children: [] },
          ...this.resolveComponents(components)
        )
      )
    }

    return resolved
  }

  private resolveComponents(
    components: GameObjectData['components'] = []
  ): Component<any>[] {
    return components.map(({ id, isOwner, name, state }) => {
      const Component = getComponentClassByName(name)
      const instance = new Component(id, state as any)

      if (instance instanceof NetworkComponent && isOwner) {
        // We cannot call `onOwnershipReceived` here because of two reasons:
        //
        // 1. NetworkManager hasn't been set yet, calling `onOwnershipReceived` will throw an error.
        // 2. Logically this also doesn't make sense, since the player is not "receiving" it, instead
        //    we setup the last state of the component. Receiving or losing an ownership is caused by
        //    actions during the match and not during the setup phase of the game.
        instance.isOwner = true
      }

      return instance
    })
  }
}
