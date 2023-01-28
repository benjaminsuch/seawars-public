import type { StoreApi } from 'zustand'

import type { ItemState } from '../../components/Item'
import type { Component } from '../../core/Component'
import type { EventDispatcherEvent } from '../../core/EventDispatcher'
import type { NetworkConnection } from '../../core/NetworkConnection'
import type { INetworkIdentity } from '../../core/NetworkIdentity'
import type { ClientArg, ClientRes, ServerArg, ServerRes } from '../../core/NetworkServer'
import type { BattlefieldData } from './Battlefield'
import type { PlayerData, PlayerReadyEvent, PlayerUnreadyEvent } from './Player'

import * as THREE from 'three'
import randomString from 'randomstring'
import createStore from 'zustand/vanilla'
import { v4 as uuid } from 'uuid'

import { CrateComponent } from '../../components/Crate'
import { GunAttackComponent } from '../../components/GunAttack'
import { HitpointsComponent } from '../../components/Hitpoints'
import { InventoryComponent } from '../../components/Inventory'
import { ItemComponent } from '../../components/Item'
import { ModelComponent } from '../../components/Model'
import { MoveableComponent } from '../../components/Moveable'
import { NetworkObjectComponent } from '../../components/NetworkObject'
import { PositionComponent } from '../../components/Position'
import { SelectableComponent } from '../../components/Selectable'
import { ShipComponent } from '../../components/Ship'
import { ShipGunComponent } from '../../components/ShipGun'
import { TargetableComponent } from '../../components/Targetable'
import { TransformComponent } from '../../components/Transform'
import { WidgetComponent } from '../../components/Widget'
import { EventDispatcher } from '../../core/EventDispatcher'
import { Game } from '../../core/Game'
import { GameError } from '../../core/GameError'
import { GameObject } from '../../core/GameObject'
import { NetworkIdentity } from '../../core/NetworkIdentity'
import { NetworkClient } from '../../core/NetworkClient'
import { NetworkManager } from '../../core/NetworkManager'
import { NetworkServer, ServerRpc } from '../../core/NetworkServer'
import { Timer } from '../../core/Timer'
import env from '../../env'
import { BattlefieldScene } from '../../scenes/Battlefield'
import { User } from '../user'
import { Battlefield } from './Battlefield'
import { Player, PlayerColors } from './Player'

export type MatchPlayerRegisteredEvent = EventDispatcherEvent<
  'match.player-registered',
  { player: Player }
>

export type MatchPlayerUnregisteredEvent = EventDispatcherEvent<
  'match.player-unregistered',
  { playerId: Player['id'] }
>

export type MatchPlayerEndTurn = EventDispatcherEvent<
  'match.player-endturn',
  { player: Player }
>

export enum MatchState {
  Idle = 0,
  Started = 1,
  Running = 2,
  Finished = 3
}

export interface MatchStore<P = Player> {
  activePlayer: string | null
  canStart: boolean
  countdown: number | null
  currentTurn: number
  players: P[]
  state: MatchState
  turnEndsAt?: Date
}

export interface MatchData {
  alias: string
  battlefield: BattlefieldData
  id: string
  store: MatchStore<PlayerData>
}

export class Match extends EventDispatcher implements INetworkIdentity {
  public static readonly START_COUNTDOWN_MS = 3000

  public static readonly TURN_COUNTDOWN_MS = 30000

  public static readonly DEFAULT_SETTINGS = {
    countdown: 30
  }

  public static readonly matches: Map<Match['alias'], Match> = new Map()

  @ServerRpc()
  public static async create(
    data?: ServerArg<Partial<MatchData>> | ClientArg<MatchData>,
    clientId = ''
  ) {
    let match: Match | undefined

    //#ifdef IS_CLIENT
    if (IS_CLIENT) {
      match = new Match(data as MatchData, NetworkClient.instance())
    }
    //#endif

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      const user = User.getUserByConnectionId(clientId)

      match = new Match(
        {
          id: uuid(),
          alias: randomString.generate(7),
          battlefield: Battlefield.DEFAULT_BATTLEFIELD,
          store: {
            activePlayer: null,
            canStart: false,
            countdown: null,
            currentTurn: 0,
            players: [Player.create({ id: user.id, isHost: true })],
            state: MatchState.Idle
          },
          ...data
        },
        NetworkServer.instance()
      )
    }
    //#endif

    return match
  }

  @ServerRpc()
  public static async load(
    aliasOrData: ServerArg<Match['alias']> | ClientArg<MatchData>,
    clientId = ''
  ) {
    const alias = IS_CLIENT
      ? (aliasOrData as MatchData).alias
      : (aliasOrData as Match['alias'])
    let match = Match.matches.get(alias)

    //#ifdef IS_CLIENT
    if (IS_CLIENT) {
      // On the client-side, it is to be expected that `match` is `undefined`.
      if (!match) {
        match = new Match(aliasOrData as MatchData, NetworkClient.instance())
      }
    }
    //#endif

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      if (env.IS_DEV && !match) {
        match = await Match.create({ alias }, clientId)
      }

      // On the server-side though, it should not happen because the server is always
      // running. Either the match does not exist because it never was created with such
      // an alias, or it doesn't exist because it has already been finished.
      if (!match) {
        throw new Error(`Match instance for id "${alias}" not found.`)
      }

      match.acknowledgePlayer(clientId)
    }
    //#endif

    return match
  }

  private readonly _networkId: NetworkIdentity

  get networkId() {
    return this._networkId.id
  }

  private timer?: Timer

  public readonly store: StoreApi<MatchStore>

  public readonly alias: MatchData['alias']

  public readonly id: MatchData['id']

  public readonly game: Game

  public readonly networkManager: NetworkManager

  public readonly battlefield: Battlefield

  constructor(data: MatchData, socketManager: NetworkClient | NetworkServer) {
    super()

    const { alias, battlefield, id, store } = data

    this._networkId = new NetworkIdentity(this, id)

    if (IS_SERVER) {
      this.game = new Game()
    } else {
      this.game = Game.instance()
    }

    this.game.sceneManager.loadScene(BattlefieldScene)
    this.game.start()

    this.alias = alias
    this.battlefield = new Battlefield(battlefield)
    this.id = id
    this.networkManager = new NetworkManager(this.game, socketManager)

    const players = store.players.map(player => new Player(this, player))
    players.forEach(player => this.setupPlayerEventListeners(player))

    this.store = createStore<MatchStore>(() => ({ ...store, players }))
    this.store.subscribe(this.onStoreUpdate.bind(this))

    //#ifdef IS_CLIENT
    if (IS_CLIENT) {
      const client = this.networkManager.getClient()

      client.subscribe('match.update')
      client.on('match.update', this.onNetworkUpdate.bind(this))

      client.subscribe('match.countdown')
      client.on('match.countdown', this.onCountdown.bind(this))

      client.subscribe('match.player-registered')
      client.on('match.player-registered', this.onPlayerRegistered.bind(this))

      client.subscribe('match.player-unregistered')
      client.on('match.player-unregistered', this.onPlayerUnregistered.bind(this))

      client.subscribe('match.next-turn')
      client.on('match.next-turn', this.onNextTurn.bind(this))
    }
    //#endif

    Match.matches.set(this.alias, this)
  }

  @ServerRpc({ type: 'notify' })
  public start(): void {
    //#ifdef IS_SERVER
    if (IS_SERVER) {
      this.store.setState({
        state: MatchState.Started,
        countdown: Match.START_COUNTDOWN_MS / 1000
      })

      //? I think we can skip the timer on the server-side and move it to the client-side.
      //? This way we can reduce network traffic that is not relevant for the gameplay.
      //? On the server-side we would just save the timestamp on which the game is ready for the players.
      this.timer = new Timer({ countdown: true, duration: Match.START_COUNTDOWN_MS })

      this.timer.on('tick', () => {
        const countdown = this.timer?.toJSON().inSeconds ?? 0
        this.store.setState({ countdown })
      })
      // Create board, fields, player ships and assign players to a starting area. All
      // gameobjects will be registered in NetworkManager and immediately spawned.
      this.timer.on('start', () => {
        const { players } = this.store.getState()
        const board = this.battlefield.createBoard(this.game)
        const startingFields = this.battlefield.getStartingFields()
        const gameObjects = [board]

        const getRandomItemPosition = (items: any[]) => {
          const pos = Math.ceil(Math.random() * this.battlefield.x)

          if (items[pos]) {
            return getRandomItemPosition(items)
          }

          return pos
        }

        const ITEM_AMOUNT = 2
        const crateCoords: any[][] = []

        for (let j = 0; j < this.battlefield.y; j++) {
          if (!crateCoords[j]) {
            crateCoords[j] = []
          }
          for (let i = 0; i < ITEM_AMOUNT; i++) {
            crateCoords[j].push({ x: getRandomItemPosition(crateCoords[j]), y: j + 1 })
          }
        }

        for (const field of this.battlefield.getItemFields()) {
          const position = field.getComponent<PositionComponent>('Position')!.getState()
          const coord = crateCoords.find(row =>
            row.find(item => item.x === position.x && item.y === position.y)
          )

          if (coord) {
            const transform = field
              .getComponent<TransformComponent>('Transform')!
              .getState()
            const crate = GameObject.create(
              this.game,
              { parent: board.id, tags: ['crate'] },
              CrateComponent.create(),
              ModelComponent.create({ name: 'Crate' }),
              NetworkObjectComponent.create(),
              PositionComponent.create(position),
              SelectableComponent.create(),
              TransformComponent.create(transform),
              WidgetComponent.create('CrateInfoWidget')
            )

            gameObjects.push(crate)
            gameObjects.push(createRandomItem(crate))
          }
        }

        players.forEach(player => {
          const { position } = player.store.getState()

          gameObjects.push(
            ...createPlayerShips(
              this.game,
              position,
              startingFields[position],
              player.user?.activeConnection.id
            )
          )
        })

        this.networkManager.registerGameObjects(gameObjects)
        this.networkManager.gameObjects.spawn()
      })
      // Start first round
      this.timer.on('complete', () => this.nextTurn())
      this.timer.start()
    }
    //#endif
  }

  /**
   * Server only.
   *
   * A method to update the ownerships, register the client id and making sure
   * the player is registered into every service that matters (e.g. Chat).
   */
  //#ifdef IS_SERVER
  public acknowledgePlayer(clientId: NetworkConnection['id']): void {
    const user = User.getUserByConnectionId(clientId)
    const player = this.store.getState().players.find(({ id }) => id === user.id)

    this.networkManager.registerClientId(clientId)

    if (!player) {
      console.warn(`Player (${user.id}) not found.`)
      return
    }

    player.store.setState({ isOnline: true })

    if (user.previousConnection) {
      this.networkManager.gameObjects.updateOwnerships(
        user.previousConnection?.id,
        user.activeConnection.id
      )
    }
  }
  //#endif

  @ServerRpc()
  public async registerPlayer(
    dataOrId: ServerArg<PlayerData['id']> | ClientArg<PlayerData>,
    clientId = ''
  ): Promise<ServerRes<Player> | ClientRes<void>> {
    const { players, state } = this.store.getState()

    if (state !== MatchState.Idle) {
      throw new GameError(
        `Match: Cannot register player. Match is running or already finished.`
      )
    }

    //#ifdef IS_CLIENT
    if (IS_CLIENT) {
      // Player is registered via `onPlayerRegistered` callback. Why?
      //
      // Registering the player here in this statement, would only work for
      // the client that called the RPC, but not for the other clients.
      //
      // In case of a successful server response, we just return the
      // player instance that has already been registered by `onPlayerRegistered`
      // at this point (I haven't checked the influence of lag though...).
    }
    //#endif

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      if (!this.isOpen()) {
        throw new GameError(`Match: Cannot join match (Lobby is full).`)
      }

      const id = dataOrId as Player['id']
      const user = User.getUserByConnectionId(clientId)

      if (id !== user.id) {
        throw new GameError(`Match: User cannot register any other player than himself.`)
      }

      const idx = players.findIndex(player => player.id === id)

      if (idx > -1) {
        throw new GameError(
          `Match: Cannot add player with id "${id}". Player already exists.`
        )
      }

      // We have to register the client before we add the player, otherwise
      // the client would not get the store update that is caused by `addPlayer`.
      this.networkManager.registerClientId(clientId)

      const player = new Player(
        this,
        Player.create({
          id: user.id,
          name: `Player ${players.length + 1}`,
          store: {
            color: PlayerColors.Blue,
            position: this.getLastPlayerPosition() + 1,
            score: 0
          }
        })
      )
      player.user = user

      // We have to set the state before we send `match.player-registered`. Otherwise
      // `onPlayerRegistered` will throw an error because it cannot find the player (
      // because the local match store from the user has not been updated yet).
      this.store.setState({ players: players.concat(player) })

      this.setupPlayerEventListeners(player)
      this.networkManager.connections.send('match.player-registered', player.id)

      return player
    }
    //#endif
  }

  @ServerRpc()
  public async unregisterPlayer(
    id: PlayerData['id'],
    clientId = ''
  ): Promise<ServerRes<Player> | ClientRes<void>> {
    const { players, state } = this.store.getState()

    if (state !== MatchState.Idle) {
      throw new GameError(
        `Match: Cannot unregister player. Match is running or already finished.`
      )
    }

    if (IS_SERVER) {
      const player = players.find(player => id === player.id)

      if (!player) {
        throw new GameError(
          `Match: Cannot unregister player with id "${id}". Player does not exist.`
        )
      }

      if (player.user?.activeConnection.id !== clientId) {
        throw new GameError(`Match: User does not control player with id "${id}".`)
      }

      this.store.setState({ players: players.filter(player => player.id !== id) })

      this.networkManager.unregisterClientId(clientId)
      this.networkManager.connections.send('match.player-unregistered', id)

      return player
    }
  }

  public setupPlayerEventListeners(player: Player): void {
    player.addEventListener<PlayerReadyEvent>(
      'player.ready',
      this.onPlayerReady.bind(this)
    )
    player.addEventListener<PlayerUnreadyEvent>(
      'player.unready',
      this.onPlayerUnready.bind(this)
    )
  }

  @ServerRpc({ type: 'notify' })
  public spawnGameObjects(_?: unknown, clientId = ''): void {
    if (IS_SERVER) {
      this.networkManager.gameObjects.requestSpawn(clientId)
    }
  }

  public canStart(): boolean {
    const { players, state } = this.store.getState()
    const { minPlayers, maxPlayers } = this.battlefield

    const hasEnoughPlayers = players.length >= minPlayers && players.length <= maxPlayers
    const areReady = players.every(player => player.store.getState().isReady)
    const isIdle = state === MatchState.Idle

    return isIdle && hasEnoughPlayers && areReady
  }

  @ServerRpc({ type: 'notify' })
  public endTurn(_?: unknown, clientId = ''): void {
    const { activePlayer } = this.store.getState()

    if (activePlayer) {
      const player = this.getPlayerById(activePlayer)

      if (player?.user?.activeConnection.id === clientId) {
        this.game.sceneManager.activeScene.dispatchEvent<MatchPlayerEndTurn>(
          'match.player-endturn',
          { player }
        )
        this.nextTurn()
      }
    }
  }

  public isOpen(): boolean {
    const { players, state } = this.store.getState()
    return state === MatchState.Idle && players.length < this.battlefield.maxPlayers
  }

  public getPlayerById(id: Player['id']): Player | undefined {
    return this.store.getState().players.find(player => player.id === id)
  }

  public toJSON(): MatchData {
    const { players, ...store } = this.store.getState()

    return {
      alias: this.alias,
      battlefield: this.battlefield.toJSON(),
      id: this.id,
      store: {
        ...store,
        players: players.map(player => player.toJSON())
      }
    }
  }

  private nextTurn(): void {
    const { activePlayer, currentTurn, players } = this.store.getState()
    const currentPlayer = this.getPlayerById(activePlayer ?? '')

    let pos = 0

    if (currentPlayer) {
      pos = currentPlayer.store.getState().position + 1

      if (pos > this.getLastPlayerPosition()) {
        pos = 0
      }
    }

    const nextPlayer = players.find(player => player.store.getState().position === pos)

    // This should never happen
    if (!nextPlayer) {
      throw new GameError(`Match: No player found for position "${pos}".`)
    }

    this.store.setState({
      activePlayer: nextPlayer.id,
      currentTurn: currentTurn + 1,
      state: MatchState.Running,
      turnEndsAt: getTurnsEndDate()
    })
    this.networkManager.connections.send('match.next-turn', nextPlayer.id)
  }

  private getLastPlayerPosition(): number {
    const { players } = this.store.getState()

    return (
      players
        .map(player => player.store.getState().position)
        .sort((a, b) => a - b)
        .pop() ?? 0
    )
  }

  //#ifdef IS_CLIENT
  private onNetworkUpdate({ store, ...data }: Partial<MatchData>): void {
    Object.entries(data).forEach(([key, val]) => {
      this[key] = val
    })

    if (store) {
      this.store.setState({
        ...store,
        players: store.players.map(player => new Player(this, player))
      })
    }
  }
  //#endif

  private onStoreUpdate(store: MatchStore<PlayerData>): void {
    if (IS_SERVER) {
      this.networkManager.connections.send('match.update', { store })
    }
  }

  private onCountdown(data: ReturnType<Timer['toJSON']>): void {
    this.store.setState({ countdown: data.inSeconds })
  }

  private onNextTurn(id: Player['id']): void {
    if (IS_CLIENT) {
      this.store.setState({ activePlayer: id })
    }
  }

  //#ifdef IS_CLIENT
  private onPlayerRegistered(id: Player['id']): void {
    const player = this.getPlayerById(id)

    if (!player) {
      throw new GameError(`Match: Player (${id}) not found.`)
    }

    this.setupPlayerEventListeners(player)
    this.dispatchEvent<MatchPlayerRegisteredEvent>('match.player-registered', { player })
  }
  //#endif

  //#ifdef IS_CLIENT
  private onPlayerUnregistered(id: Player['id']): void {
    this.dispatchEvent<MatchPlayerUnregisteredEvent>('match.player-unregistered', {
      playerId: id
    })
  }
  //#endif

  private onPlayerReady(): void {
    this.store.setState({ canStart: this.canStart() })
  }

  private onPlayerUnready(): void {
    this.store.setState({ canStart: this.canStart() })
  }
}

const createPlayerShips = (
  game: Match['game'],
  position: number,
  fields: GameObject[],
  ownerId?: NetworkConnection['id']
): GameObject[] => {
  const rotation = new THREE.Euler(0, position === 0 ? Math.PI : 0, 0)

  const getField = () => {
    const field = getRandomField(fields)
    const position = field.getComponent<PositionComponent>('Position')
    const transform = field.getComponent<TransformComponent>('Transform')

    if (!position || !transform) {
      throw new Error(`Field has no Position or no Transform component.`)
    }

    return { parent: field.parent?.id, position, transform }
  }

  const [field1, field2, field3, field4, field5] = [
    getField(),
    getField(),
    getField(),
    getField(),
    getField()
  ]

  const gameObjects: GameObject[] = [
    GameObject.create(
      game,
      { parent: field1.parent, tags: ['aircraftcarrier', 'ship'] },
      HitpointsComponent.create({ current: 12, max: 12 }),
      InventoryComponent.create({ slots: 3 }),
      ModelComponent.create({ name: 'AircraftCarrier' }),
      MoveableComponent.create(),
      NetworkObjectComponent.create(),
      PositionComponent.create(field1.position.getState()),
      SelectableComponent.create(),
      ShipComponent.create({ name: 'Aircraft Carrier' }),
      TargetableComponent.create(),
      TransformComponent.create({
        position: field1.transform.getState().position,
        rotation
      }),
      WidgetComponent.create('ShipOverlayWidget')
    ),
    GameObject.create(
      game,
      { parent: field2.parent, tags: ['battlecruiser', 'ship'] },
      GunAttackComponent.create(),
      HitpointsComponent.create({ current: 10, max: 10 }),
      InventoryComponent.create({ slots: 3 }),
      ModelComponent.create({ name: 'Battlecruiser' }),
      MoveableComponent.create(),
      NetworkObjectComponent.create(),
      PositionComponent.create(field2.position.getState()),
      SelectableComponent.create(),
      ShipComponent.create({ name: 'Battlecruiser' }),
      TargetableComponent.create(),
      TransformComponent.create({
        position: field2.transform.getState().position,
        rotation
      }),
      WidgetComponent.create('ShipOverlayWidget')
    ),
    GameObject.create(
      game,
      { parent: field3.parent, tags: ['corvette', 'ship'] },
      GunAttackComponent.create(),
      HitpointsComponent.create({ current: 5, max: 5 }),
      InventoryComponent.create({ slots: 1 }),
      ModelComponent.create({ name: 'Corvette' }),
      MoveableComponent.create(),
      NetworkObjectComponent.create(),
      PositionComponent.create(field3.position.getState()),
      SelectableComponent.create(),
      ShipComponent.create({ name: 'Corvette' }),
      TargetableComponent.create(),
      TransformComponent.create({
        position: field3.transform.getState().position,
        rotation
      }),
      WidgetComponent.create('ShipOverlayWidget')
    ),
    GameObject.create(
      game,
      { parent: field4.parent, tags: ['frigate', 'ship'] },
      GunAttackComponent.create(),
      HitpointsComponent.create({ current: 6, max: 6 }),
      InventoryComponent.create({ slots: 2 }),
      ModelComponent.create({ name: 'Frigate' }),
      MoveableComponent.create(),
      NetworkObjectComponent.create(),
      PositionComponent.create(field4.position.getState()),
      SelectableComponent.create(),
      ShipComponent.create({ name: 'Frigate' }),
      TargetableComponent.create(),
      TransformComponent.create({
        position: field4.transform?.getState().position,
        rotation
      }),
      WidgetComponent.create('ShipOverlayWidget')
    ),
    GameObject.create(
      game,
      { parent: field5.parent, tags: ['destroyer', 'ship'] },
      GunAttackComponent.create(),
      HitpointsComponent.create({ current: 8, max: 8 }),
      InventoryComponent.create({ slots: 2 }),
      ModelComponent.create({ name: 'Destroyer' }),
      MoveableComponent.create(),
      NetworkObjectComponent.create(),
      PositionComponent.create(field5.position.getState()),
      SelectableComponent.create(),
      ShipComponent.create({ name: 'Destroyer' }),
      TargetableComponent.create(),
      TransformComponent.create({
        position: field5.transform?.getState().position,
        rotation
      }),
      WidgetComponent.create('ShipOverlayWidget')
    )
  ]
  const [aircraftCarrier, battlecruiser, corvette, destroyer, frigate] = gameObjects

  const guns = {
    battlecruiser: [
      [0.5, 6.15, 28],
      [0.5, 5.5, 17],
      [0.5, 5, -49.5]
    ],
    corvette: [[0.5, 4.7, 11.2]],
    destroyer: [
      [0.5, 5.35, 7.75],
      [0.5, 4.8, 15]
    ],
    frigate: [
      [0.5, 5.5, 22.5],
      [0.5, 5.05, 12]
    ]
  }

  guns.battlecruiser.forEach(position => {
    gameObjects.push(
      GameObject.create(
        game,
        { parent: battlecruiser.id, tags: ['shipgun', 'weapon'] },
        ModelComponent.create({ name: 'ShipGun' }),
        NetworkObjectComponent.create(),
        ShipGunComponent.create({ variant: 'cannon06' }),
        TransformComponent.create({ position, scale: [1.75, 1.75, 1.75] })
      )
    )
  })

  guns.corvette.forEach(position => {
    gameObjects.push(
      GameObject.create(
        game,
        { parent: corvette.id, tags: ['shipgun', 'weapon'] },
        ModelComponent.create({ name: 'ShipGun' }),
        NetworkObjectComponent.create(),
        ShipGunComponent.create({ variant: 'cannon06' }),
        TransformComponent.create({ position, scale: [1.75, 1.75, 1.75] })
      )
    )
  })

  guns.frigate.forEach(position => {
    gameObjects.push(
      GameObject.create(
        game,
        { parent: frigate.id, tags: ['shipgun', 'weapon'] },
        ModelComponent.create({ name: 'ShipGun' }),
        NetworkObjectComponent.create(),
        ShipGunComponent.create({ variant: 'cannon06' }),
        TransformComponent.create({ position, scale: [1.75, 1.75, 1.75] })
      )
    )
  })

  guns.destroyer.forEach(position => {
    gameObjects.push(
      GameObject.create(
        game,
        { parent: destroyer.id, tags: ['shipgun', 'weapon'] },
        ModelComponent.create({ name: 'ShipGun' }),
        NetworkObjectComponent.create(),
        ShipGunComponent.create({ variant: 'cannon06' }),
        TransformComponent.create({ position, scale: [1.25, 1.25, 1.25] })
      )
    )
  })

  if (!ownerId) {
    return gameObjects
  }

  return gameObjects.map(gameObject => {
    gameObject.getComponent<NetworkObjectComponent>('NetworkObject')?.setOwnerId(ownerId)
    return gameObject
  })
}

const createRandomItem = (
  parent: GameObject,
  ...components: Component<any>[]
): GameObject => {
  const items: ItemState[] = [
    {
      isDisabled: false,
      name: 'cannon09',
      label: 'Cannon II',
      type: 'upgrade',
      description: 'Cannon II description.',
      stats: {
        attackDamage: 2,
        attackRange: 3,
        precision: 0.75,
        critChance: 0.25,
        critDamage: 2
      }
    },
    {
      isDisabled: false,
      name: 'railgun05',
      label: 'Railgun I',
      type: 'upgrade',
      description: 'Railgun I description.',
      stats: {
        attackDamage: 1,
        attackRange: 3,
        precision: 1
      }
    },
    {
      isDisabled: false,
      name: 'railgun08',
      label: 'Railgun II',
      type: 'upgrade',
      description: 'Railgun II description.',
      stats: {
        attackDamage: 2,
        attackRange: 3,
        precision: 1
      }
    },
    {
      isDisabled: false,
      name: 'mine01',
      label: 'Naval Mine',
      type: 'item',
      description: 'Naval Mine description.',
      stats: {
        attackDamage: 4,
        charges: 3,
        critChance: 0.3,
        critDamage: 2
      }
    },
    {
      isDisabled: false,
      name: 'shell01',
      label: 'Improved Cannon Shells',
      type: 'upgrade',
      description: 'Improved Cannon Shells description.',
      stats: {
        attackRange: 1,
        attackDamage: 1,
        critChance: 0.1,
        critDamage: 0.25
      }
    },
    {
      isDisabled: false,
      name: 'torpedo01',
      label: 'Torpedo',
      type: 'item',
      description: 'Torpedo description.',
      stats: {
        precision: 0.5,
        charges: 1,
        attackDamage: 5,
        attackRange: 3,
        critChance: 0.3,
        critDamage: 2
      }
    },
    {
      isDisabled: false,
      name: 'machine02',
      label: 'Modernized Engine',
      type: 'upgrade',
      description: 'Modernized Engine description.',
      stats: {
        movement: 1
      }
    }
  ]
  const idx = Math.floor(Math.random() * items.length)

  return GameObject.create(
    parent.game,
    { parent: parent.id, tags: ['item'] },
    ItemComponent.create(items[idx]),
    NetworkObjectComponent.create(),
    TransformComponent.create(),
    ...components
  )
}

const getRandomField = (fields: GameObject[]) => {
  const copy = [...fields]
  const idx = Math.floor(Math.random() * fields.length)

  fields.splice(idx, 1)

  return copy[idx]
}

const getTurnsEndDate = (date = new Date()) => {
  let [hours, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()]

  seconds += 30

  if (seconds >= 60) {
    seconds = seconds % 60
    minutes += 1
  }

  if (minutes >= 60) {
    minutes = minutes % 60
    hours += 1
  }

  date.setSeconds(seconds)
  date.setMinutes(minutes)
  date.setHours(hours)

  return date
}
