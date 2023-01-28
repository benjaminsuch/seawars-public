import type { ComponentState } from '../core/Component'
import type {
  DispatchedEvent,
  EventDispatcherEvent,
  UnsubcribeCallback
} from '../core/EventDispatcher'
import type { GameObject } from '../core/GameObject'
import type { INetworkIdentity } from '../core/NetworkIdentity'
import type { ClientArg, ClientRes, ServerArg, ServerRes } from '../core/NetworkServer'
import type { BoardComponent } from './Board'
import type { PositionComponent } from './Position'
import type { SelectableComponent } from './Selectable'
import type { TargetableComponent, TargetableComponentTargetedEvent } from './Targetable'

import { v4 as uuid } from 'uuid'

import { GameError } from '../core/GameError'
import { NetworkComponent } from '../core/NetworkComponent'
import { NetworkIdentity } from '../core/NetworkIdentity'
import { ServerRpc } from '../core/NetworkServer'
import env from '../env'
import { MatchPlayerEndTurn } from '../modules/match'

export type GunAttackAttackEvent = EventDispatcherEvent<
  'gunAttack.attack',
  { component: GunAttackComponent; target: GameObject['id'] }
>

export interface AttackConfig {
  damage: number
}

export interface GunAttackState extends ComponentState {
  attacksDone: number
  attacksPerTurn: number
  damage: number
  isActive: boolean
  range: [number, number]
}

export class GunAttackComponent
  extends NetworkComponent<GunAttackState>
  implements INetworkIdentity
{
  public static create(data?: Partial<GunAttackState>) {
    return new GunAttackComponent(uuid(), {
      attacksDone: 0,
      attacksPerTurn: 1,
      damage: 2,
      range: [3, 3],
      isActive: false,
      isDisabled: false,
      ...data
    })
  }

  private readonly _networkId: NetworkIdentity

  get networkId() {
    return this._networkId.id
  }

  private unsubscribeTargetListener: UnsubcribeCallback = () => null

  public targets: GameObject[] = []

  constructor(id: GunAttackComponent['id'], state: GunAttackState) {
    super({ id, name: 'GunAttack' }, state)

    this._networkId = new NetworkIdentity(this, id)
  }

  //#ifdef IS_CLIENT
  public start(): void {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`GunAttackComponent: Client does not own this gameobject.`)
      }
    }

    if (!this.canAttack()) {
      throw new GameError(
        `GunAttackComponent: Validation failed. Gameobject cannot attack.`
      )
    }

    this.targets = this.getTargets()
    this.unsubscribeTargetListener =
      this.getActiveScene().addEventListener<TargetableComponentTargetedEvent>(
        'targetable.targeted',
        this.onTargetSelected.bind(this)
      )

    for (const target of this.targets) {
      target.getComponent<TargetableComponent>('Targetable')?.isTargetable(true)
    }

    for (const gameObject of this.getActiveScene().gameObjects.getList()) {
      if (gameObject.id !== this.gameObject?.id) {
        gameObject.getComponent<SelectableComponent>('Selectable')?.disable()
      }
    }

    this.store.setState({ isActive: true })
  }
  //#endif

  //#ifdef IS_CLIENT
  public cancel(): void {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`GunAttackComponent: Client does not own this gameobject.`)
      }
    }

    this.unsubscribeTargetListener()
    this.resetTargets()
    this.store.setState({ isActive: false })
  }
  //#endif

  @ServerRpc()
  public attack(
    id: ServerArg<GameObject['id']> | ClientArg<GameObject['id']>
  ): ClientRes<void> | ServerRes<GameObject['id']> {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`GunAttackComponent: Client does not own this gameobject.`)
      }

      this.unsubscribeTargetListener()
      this.resetTargets()
    }

    if (IS_SERVER) {
      if (!this.canAttack()) {
        throw new GameError(
          `GunAttackComponent: Validation failed. Gameobject cannot attack.`
        )
      }

      this.targets = this.getTargets()

      if (!this.inTargets(id)) {
        throw new GameError(`GunAttackComponent: Validation failed. Invalid target.`)
      }

      this.unsubscribeTargetListener()
      this.resetTargets()
    }

    this.getActiveScene().dispatchEvent<GunAttackAttackEvent>('gunAttack.attack', {
      component: this,
      target: id
    })

    if (IS_SERVER) {
      this.store.setState(state => ({
        attacksDone: state.attacksDone + 1,
        isActive: false
      }))

      return id
    }
  }

  public canAttack(): boolean {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`GunAttackComponent: Client does not own this gameobject.`)
      }
    }

    const { isDisabled, attacksDone, attacksPerTurn } = this.getState()

    return !isDisabled && attacksDone < attacksPerTurn
  }

  public getTargets(): GameObject[] {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`GunAttackComponent: Client does not own this gameobject.`)
      }
    }

    const board = this.getBoardComponent()
    const { x, y } = this.getPositionComponent().getState()
    const [rangeX, rangeY] = this.getState().range
    const [minX, maxX, minY, maxY] = [x - rangeX, x + rangeX, y - rangeY, y + rangeY]

    return board.getGameObjectsInRange([minX, maxX], [minY, maxY]).filter(gameObject => {
      const state = this.getPositionComponent(gameObject).getState()
      const networkObject = this.networkManager?.gameObjects.getNetworkObject(gameObject)

      // This is not good as it only works for game objects that are network objects.
      if (IS_CLIENT) {
        if (this.getNetworkObject().isOwner && networkObject?.isOwner) {
          return env.IS_DEV
        }
      }

      if (IS_SERVER) {
        if (this.getNetworkObject().ownerId === networkObject?.ownerId) {
          return env.IS_DEV
        }
      }

      if (this.gameObject.id === gameObject.id) {
        return false
      }

      return (
        board
          .getGameObjectsByPosition(state.x, state.y)
          .findIndex(({ tags }) => tags.has('ship')) > -1
      )
    })
  }

  protected onGameObjectReady(): void {
    this.getActiveScene().addEventListener<MatchPlayerEndTurn>(
      'match.player-endturn',
      ({ player }) => {
        if (this.ownerId === player.user?.activeConnection.id) {
          this.resetStateAfterTurnEnd()
        }
      }
    )
  }

  private resetStateAfterTurnEnd(): void {
    this.store.setState({ attacksDone: 0 })
  }

  private inTargets(id: GameObject['id']): boolean {
    return this.targets.findIndex(target => target.id === id) > -1
  }

  private resetTargets(): void {
    for (const target of this.targets) {
      target.getComponent<TargetableComponent>('Targetable')?.isTargetable(false)
    }

    for (const gameObject of this.getActiveScene().gameObjects.getList()) {
      if (!gameObject.tags.has('field') && gameObject.id !== this.gameObject?.id) {
        gameObject.getComponent<SelectableComponent>('Selectable')?.enable()
      }
    }

    this.targets = []
  }

  private getBoard(): GameObject {
    const [board] = this.getActiveScene().gameObjects.getGameObjectsByTags(['board'])

    if (!board) {
      throw new GameError(`GunAttackComponent: Missing gameobject: Board.`)
    }

    return board
  }

  private getBoardComponent(): BoardComponent {
    const board = this.getBoard().getComponent<BoardComponent>('Board')

    if (!board) {
      throw new GameError(`GunAttackComponent: Board not found.`)
    }

    return board
  }

  private getPositionComponent(
    gameObject: GameObject = this.gameObject
  ): PositionComponent {
    const position = gameObject.getComponent<PositionComponent>('Position')

    if (!position) {
      throw new GameError(
        `GunAttackComponent: Gameobject (${[
          ...gameObject.tags.values()
        ]}) does not have 'PositionComponent'.`
      )
    }

    return position
  }

  private onTargetSelected(
    event: DispatchedEvent<TargetableComponentTargetedEvent>
  ): void {
    const { component } = event

    if (!this.isOrigin(component) && this.getState().isActive) {
      try {
        this.attack(component.gameObject.id)
      } catch (error) {
        if (env.IS_DEV) {
          console.warn(error)
        }
      }
    }
  }
}
