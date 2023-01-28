import type { ComponentState } from '../core/Component'
import type { DispatchedEvent } from '../core/EventDispatcher'
import type { GameObject } from '../core/GameObject'
import type { CrateComponent, CrateDidPickUpEvent } from './Crate'
import type { FieldDidEnterEvent } from './Field'
import type { HitpointsComponent } from './Hitpoints'
import type { InventoryComponent } from './Inventory'
import type { GunAttackAttackEvent } from './GunAttack'
import type { SelectableComponent, SelectableComponentSelectedEvent } from './Selectable'

import { v4 as uuid } from 'uuid'

import { GameError } from '../core/GameError'
import { NetworkComponent } from '../core/NetworkComponent'
import { PositionComponent } from './Position'

export interface ShipState extends ComponentState {
  name: string
}

/**
 * Ship Controller Component
 *
 * @description
 * Components only manage their own state and provide functionality to modify it.
 * But who controls, what to do in scenarios where multiple events happen which
 * affect multiple components? A 'Controller-Component' like this ShipComponent
 * acts as a controller and fulfills this job.
 *
 * It listens to various events, checks the state of the components and calls
 * methods to make sure the game object has the correct behavior.
 */
export class ShipComponent extends NetworkComponent<ShipState> {
  public static create(data?: Partial<ShipState>) {
    return new ShipComponent(uuid(), {
      isDisabled: false,
      name: 'Ship',
      ...data
    })
  }

  constructor(id: ShipComponent['id'], state: ShipState) {
    super({ id, name: 'Ship' }, state)
  }

  protected onGameObjectAssigned(): void {
    super.onGameObjectAssigned()

    this.getActiveScene().addEventListener<SelectableComponentSelectedEvent>(
      'gameObject.selected',
      this.onGameObjectSelected.bind(this)
    )

    this.getActiveScene().addEventListener<GunAttackAttackEvent>(
      'gunAttack.attack',
      this.onGunAttack.bind(this)
    )

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      this.getActiveScene().addEventListener<FieldDidEnterEvent>(
        'field.did-enter',
        this.onFieldEnter.bind(this)
      )
    }
    //#endif
  }

  //#ifdef IS_SERVER
  private onFieldEnter({ field, gameObject }: DispatchedEvent<FieldDidEnterEvent>): void {
    if (this.gameObject.id === gameObject.id) {
      this.pickUpCrates(field)
    }
  }
  //#endif

  private onGameObjectSelected(
    event: DispatchedEvent<SelectableComponentSelectedEvent>
  ): void {
    const selectable = this.gameObject.getComponent<SelectableComponent>('Selectable')

    if (selectable?.id !== event.component.id) {
      selectable?.unselect()
    }
  }

  private onGunAttack(event: DispatchedEvent<GunAttackAttackEvent>): void {
    if (event.target !== this.gameObject.id) {
      return
    }

    const hitpoints = this.gameObject.getComponent<HitpointsComponent>('Hitpoints')
    const { damage } = event.component.getState()

    hitpoints?.setHitpoints(hitpoints.getState().current - damage)
  }

  //#ifdef IS_SERVER
  private pickUpCrates(field: GameObject): void {
    const { x, y } = this.getPositionComponent(field).getState()
    const inventory = this.getInventoryComponent()
    const crates = field.parent?.getChildrenByTag('crate') ?? []

    for (const crate of crates) {
      const { isDisabled, item } = this.getCrateComponent(crate).getState()
      const position = this.getPositionComponent(crate).getState()

      if (isDisabled) {
        return
      }

      if (x === position.x && y === position.y) {
        try {
          if (item) {
            inventory.addItem(item)
          }

          this.getActiveScene().dispatchEvent<CrateDidPickUpEvent>('crate.did-pickup', {
            crate,
            gameObject: this.gameObject
          })
          this.getNetworkObject().emit('crate.did-pickup', {
            crate: crate.id,
            gameObject: this.gameObject.id
          })
        } catch (error) {
          console.warn(error)
        }
      }
    }
  }
  //#endif

  private getCrateComponent(gameObject: GameObject = this.gameObject): CrateComponent {
    const crate = gameObject.getComponent<CrateComponent>('Crate')

    if (!crate) {
      throw new GameError(
        `ShipComponent: Gameobject (${[
          ...gameObject.tags.values()
        ]}) does not have 'CrateComponent'.`
      )
    }

    return crate
  }

  private getInventoryComponent(
    gameObject: GameObject = this.gameObject
  ): InventoryComponent {
    const crate = gameObject.getComponent<InventoryComponent>('Inventory')

    if (!crate) {
      throw new GameError(
        `ShipComponent: Gameobject (${[
          ...gameObject.tags.values()
        ]}) does not have 'InventoryComponent'.`
      )
    }

    return crate
  }

  private getPositionComponent(
    gameObject: GameObject = this.gameObject
  ): PositionComponent {
    const position = gameObject.getComponent<PositionComponent>('Position')

    if (!position) {
      throw new GameError(
        `ShipComponent: Gameobject (${[
          ...gameObject.tags.values()
        ]}) does not have 'PositionComponent'.`
      )
    }

    return position
  }
}
