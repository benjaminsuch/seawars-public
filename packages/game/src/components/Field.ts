import type { EventDispatcherEvent } from '../core/EventDispatcher'
import type { GameObject } from '../core/GameObject'
import type { PositionComponent } from './Position'
import type { TransformComponent } from './Transform'

import { v4 as uuid } from 'uuid'

import { ComponentState } from '../core/Component'
import { GameError } from '../core/GameError'
import { NetworkComponent } from '../core/NetworkComponent'
import env from '../env'

export type FieldWillEnterEvent = EventDispatcherEvent<
  'field.will-enter',
  { field: GameObject; gameObject: GameObject }
>

export type FieldWillLeaveEvent = EventDispatcherEvent<
  'field.will-leave',
  { field: GameObject; gameObject: GameObject }
>

export type FieldDidEnterEvent = EventDispatcherEvent<
  'field.did-enter',
  { field: GameObject; gameObject: GameObject }
>

export type FieldDidLeaveEvent = EventDispatcherEvent<
  'field.did-leave',
  { field: GameObject; gameObject: GameObject }
>

export interface FieldState extends ComponentState {
  /**
   * Board index
   */
  index: number
  isEnterable?: boolean
  isHighlighted: boolean
  isStartingField: boolean
}

export type FieldComponentCreateData = Pick<FieldState, 'index'> &
  Partial<Omit<FieldState, 'index'>>

/**
 * Field Controller
 */
export class FieldComponent extends NetworkComponent<FieldState> {
  public static create(data: FieldComponentCreateData) {
    return new FieldComponent(uuid(), {
      isDisabled: false,
      isEnterable: true,
      isHighlighted: false,
      isStartingField: false,
      ...data
    })
  }

  constructor(id: FieldComponent['id'], state: FieldState) {
    super({ id, name: 'Field' }, state)
  }

  //#ifdef IS_SERVER
  public enter(gameObject: GameObject): void {
    const positionComponent = gameObject.getComponent<PositionComponent>('Position')
    const transformComponent = gameObject.getComponent<TransformComponent>('Transform')

    if (!transformComponent) {
      throw new GameError(
        `FieldComponent: No 'TransformComponent' found in gameobject (${gameObject.id}).`
      )
    }

    if (env.IS_DEV) {
      if (!positionComponent) {
        console.error(
          `FieldComponent: No 'PositionComponent' found in gameobject (${gameObject.id}). ` +
            `This won't cause an error in production, but can lead to gameplay issues and bugs.`
        )
      }
    }

    if (this.isBlocking(gameObject)) {
      this.block()
    }

    // It's fine for `position` to be undefined in production. Components should not cause
    // interrupting errors during production.
    if (positionComponent) {
      const { x, y } = this.getPositionComponent().getState()
      const { position } = this.getTransformComponent().getState()

      positionComponent.store.setState({ x, y })
      transformComponent.store.setState({ position: position.clone() })
    }

    // But we still fire the 'did-enter' event, we should not assume it's not relevant,
    // in case `position` is undefined.
    this.getActiveScene().dispatchEvent<FieldDidEnterEvent>('field.did-enter', {
      field: this.gameObject,
      gameObject
    })
    this.getNetworkObject().emit('field.did-enter', {
      field: this.id,
      gameObject: gameObject.id
    })
  }
  //#endif

  //#ifdef IS_SERVER
  public leave(gameObject: GameObject): void {
    if (this.isBlocking(gameObject)) {
      this.unblock()
    }

    this.getActiveScene().dispatchEvent<FieldDidLeaveEvent>('field.did-leave', {
      field: this.gameObject,
      gameObject
    })
    this.getNetworkObject().emit('field.did-leave', {
      field: this.id,
      gameObject: gameObject.id
    })
  }
  //#endif

  /**
   * Checks if the gameobject is blocking the field or not.
   */
  private isBlocking(gameObject: GameObject): boolean {
    return gameObject.tags.has('ship')
  }

  private block(): void {
    this.store.setState({ isEnterable: false })
  }

  private unblock(): void {
    this.store.setState({ isEnterable: true })
  }

  private getPositionComponent(): PositionComponent {
    const position = this.gameObject.getComponent<PositionComponent>('Position')

    if (!position) {
      throw new GameError(
        `FieldComponent: Unable to find 'PositionComponent' in gameobject.`
      )
    }

    return position
  }

  private getTransformComponent(): TransformComponent {
    const transform = this.gameObject.getComponent<TransformComponent>('Transform')

    if (!transform) {
      throw new GameError(
        `FieldComponent: Unable to find 'TransformComponent' in gameobject.`
      )
    }

    return transform
  }
}
