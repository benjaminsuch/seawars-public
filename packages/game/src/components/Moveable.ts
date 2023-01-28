import type { ComponentState } from '../core/Component'
import type { DispatchedEvent, UnsubcribeCallback } from '../core/EventDispatcher'
import type { GameObject } from '../core/GameObject'
import type { MatchPlayerEndTurn } from '../modules/match'
import type { INetworkIdentity } from '../core/NetworkIdentity'
import type { ClientArg, ClientRes, ServerArg, ServerRes } from '../core/NetworkServer'
import type { BoardComponent } from './Board'
import type { FieldComponent } from './Field'
import type { PositionComponent } from './Position'
import type { SelectableComponent, SelectableComponentSelectedEvent } from './Selectable'

import { v4 as uuid } from 'uuid'

import { GameError } from '../core/GameError'
import { NetworkComponent } from '../core/NetworkComponent'
import { NetworkIdentity } from '../core/NetworkIdentity'
import { ServerRpc } from '../core/NetworkServer'
import env from '../env'

export type MoveActionParams = { x: number; y: number }

export interface MoveableState extends ComponentState {
  movementsDone: number
  movementsPerTurn: number
  /**
   * The amount of fields a game object can move on the "x" and "y" axis.
   */
  range: [number, number]
  isActive: boolean
}

export class MoveableComponent
  extends NetworkComponent<MoveableState>
  implements INetworkIdentity
{
  public static create(data?: Partial<MoveableState>) {
    return new MoveableComponent(uuid(), {
      movementsDone: 0,
      movementsPerTurn: 1,
      range: [2, 2],
      isActive: false,
      isDisabled: false,
      ...data
    })
  }

  private readonly _networkId: NetworkIdentity

  get networkId() {
    return this._networkId.id
  }

  private unsubscribeFieldListener: UnsubcribeCallback = () => null

  public targets: GameObject[] = []

  constructor(id: MoveableComponent['id'], state: MoveableState) {
    super({ id, name: 'Moveable' }, state)

    this._networkId = new NetworkIdentity(this, id)
  }

  //#ifdef IS_CLIENT
  public start(): void {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`MoveableComponent: Client does not own this gameobject.`)
      }
    }

    if (!this.canMove()) {
      throw new GameError(`MoveableComponent: Validation failed. Gameobject cannot move.`)
    }

    this.targets = this.getTargets()
    this.unsubscribeFieldListener =
      this.getActiveScene().addEventListener<SelectableComponentSelectedEvent>(
        'gameObject.selected',
        this.onFieldSelected.bind(this)
      )

    for (const target of this.targets) {
      target.getComponent<SelectableComponent>('Selectable')?.enable()
    }

    // Disable the SelectComponent from every gameobject, that is not in `this.target`.
    for (const gameObject of this.getActiveScene().gameObjects.getList()) {
      if (!this.inTargets(gameObject.id) && gameObject.id !== this.gameObject?.id) {
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
        throw new GameError(`MoveableComponent: Client does not own this gameobject.`)
      }
    }

    this.unsubscribeFieldListener()
    this.resetTargets()
    this.store.setState({ isActive: false })
  }
  //#endif

  @ServerRpc()
  public move(
    id: ServerArg<GameObject['id']> | ClientArg<GameObject['id']>
  ): ClientRes<void> | ServerRes<GameObject['id']> {
    //#ifdef IS_CLIENT
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`MoveableComponent: Client does not own this gameobject.`)
      }
    }
    //#endif

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      if (!this.canMove()) {
        throw new GameError(
          `MoveableComponent: Validation failed. Gameobject cannot move.`
        )
      }

      this.targets = this.getTargets()

      if (!this.inTargets(id)) {
        throw new GameError(`MoveableComponent: Validation failed. Invalid target.`)
      }
    }
    //#endif

    this.unsubscribeFieldListener()
    this.resetTargets()

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      const nextField = this.getNetworkManager().gameObjects.get(id)

      this.getFieldComponent(this.getField()).leave(this.gameObject)
      this.getFieldComponent(nextField).enter(this.gameObject)

      this.store.setState(state => ({
        movementsDone: state.movementsDone + 1,
        isActive: false
      }))

      return id
    }
    //#endif
  }

  //TODO: Check if it's the player's turn of the current round
  //TODO: Validate that the gameobject can be controlled by the player
  public canMove(): boolean {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`MoveableComponent: Client does not own this gameobject.`)
      }
    }

    if (env.IS_DEV) {
      return true
    }

    const { isDisabled, movementsDone, movementsPerTurn } = this.getState()

    return !isDisabled && movementsDone < movementsPerTurn
  }

  public getTargets(): GameObject[] {
    if (IS_CLIENT) {
      if (!this.isOwner) {
        throw new GameError(`MoveableComponent: Client does not own this gameobject.`)
      }
    }

    const board = this.getBoardComponent()
    const { x, y } = this.getPositionComponent().getState()
    const [rangeX, rangeY] = this.getState().range
    const [minX, maxX, minY, maxY] = [x - rangeX, x + rangeX, y - rangeY, y + rangeY]

    return board.getGameObjectsInRange([minX, maxX], [minY, maxY]).filter(gameObject => {
      return gameObject.getComponent<FieldComponent>('Field')?.getState().isEnterable
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
    this.store.setState({ movementsDone: 0 })
  }

  private resetTargets(): void {
    for (const target of this.getActiveScene().gameObjects.getList()) {
      const selectable = target.getComponent<SelectableComponent>('Selectable')

      if (target.components.has('Field')) {
        selectable?.unselect()
        selectable?.disable()
      } else {
        selectable?.enable()
      }
    }

    this.targets = []
  }

  private getBoard(): GameObject {
    const [board] = this.getActiveScene().gameObjects.getGameObjectsByTags(['board'])

    if (!board) {
      throw new GameError(`MoveableComponent: Missing gameobject: Board.`)
    }

    return board
  }

  private getBoardComponent(): BoardComponent {
    const board = this.getBoard().getComponent<BoardComponent>('Board')

    if (!board) {
      throw new GameError(`MoveableComponent: Board not found.`)
    }

    return board
  }

  private getPositionComponent(
    gameObject: GameObject = this.gameObject
  ): PositionComponent {
    const position = gameObject.getComponent<PositionComponent>('Position')

    if (!position) {
      throw new GameError(
        `MoveableComponent: Gameobject (${[
          ...gameObject.tags.values()
        ]}) does not have 'PositionComponent'.`
      )
    }

    return position
  }

  private getFieldComponent(gameObject?: GameObject): FieldComponent {
    const field = gameObject?.getComponent<FieldComponent>('Field')

    if (!field) {
      throw new GameError(`MoveableComponent: Missing component: Field.`)
    }

    return field
  }

  private getField(): GameObject {
    const { x, y } = this.getPositionComponent().getState()
    let field: GameObject | undefined

    for (const gameObject of this.getNetworkManager().gameObjects.getGameObjectsByComponent(
      'Field'
    )) {
      const state = this.getPositionComponent(gameObject).getState()

      if (state.x === x && state.y === y) {
        field = gameObject
      }
    }

    if (!field) {
      throw new GameError(`MoveableComponent: Field with coords ${x}-${y} not found.`)
    }

    return field
  }

  private inTargets(id: GameObject['id']): boolean {
    return this.targets.findIndex(target => target.id === id) > -1
  }

  private onFieldSelected(
    event: DispatchedEvent<SelectableComponentSelectedEvent>
  ): void {
    const { component } = event

    if (!this.isOrigin(component) && this.getState().isActive) {
      try {
        this.move(component.gameObject.id)
      } catch (error) {
        if (env.IS_DEV) {
          console.warn(error)
        }
      }
    }
  }
}
