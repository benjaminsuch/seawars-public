import type { ComponentState } from '../core/Component'
import type { DispatchedEvent, EventDispatcherEvent } from '../core/EventDispatcher'
import type { GameObject, GameObjectChildAddedEvent } from '../core/GameObject'
import type { ItemComponent, ItemState } from './Item'
import type { SelectableComponent, SelectableComponentSelectedEvent } from './Selectable'

import { v4 as uuid } from 'uuid'

import { NetworkComponent } from '../core/NetworkComponent'

export type CrateDidPickUpEvent = EventDispatcherEvent<
  'crate.did-pickup',
  { crate: GameObject; gameObject: GameObject }
>

export type CrateAnimatePickUpEvent = EventDispatcherEvent<
  'crate.animate-pickup',
  Record<string, never>
>

export interface CrateState extends ComponentState {
  item?: ItemState
}

export class CrateComponent extends NetworkComponent<CrateState> {
  public static create(data?: Partial<CrateState>) {
    return new CrateComponent(uuid(), {
      isDisabled: false,
      ...data
    })
  }

  constructor(id: CrateComponent['id'], state: CrateState) {
    super({ id, name: 'Crate' }, state)
  }

  protected onGameObjectAssigned(): void {
    super.onGameObjectAssigned()

    this.getActiveScene().addEventListener<SelectableComponentSelectedEvent>(
      'gameObject.selected',
      this.onGameObjectSelected.bind(this)
    )

    //#ifdef IS_SERVER
    if (IS_SERVER) {
      this.getActiveScene().addEventListener<CrateDidPickUpEvent>(
        'crate.did-pickup',
        this.onCratePickUp.bind(this)
      )
    }
    //#endif
  }

  protected onNetworkManagerReceived(): void {
    super.onNetworkManagerReceived()

    //#ifdef IS_CLIENT
    if (IS_CLIENT) {
      const client = this.getNetworkManager().getClient()

      client.subscribe('crate.did-pickup')
      client.on('crate.did-pickup', this.onNetworkCratePickUp.bind(this))
    }
    //#endif
  }

  protected onChildAdded({ gameObject }: GameObjectChildAddedEvent['data']): void {
    //#ifdef IS_SERVER
    if (IS_SERVER) {
      if (gameObject.parent?.id === this.gameObject.id) {
        const itemComponent = gameObject.getComponent<ItemComponent>('Item')

        if (!this.getState().item && itemComponent) {
          this.store.setState({ item: itemComponent.getState() })
        }
      }
    }
    //#endif
  }

  //#ifdef IS_CLIENT
  private onNetworkCratePickUp(data: {
    crate: GameObject['id']
    gameObject: GameObject['id']
  }): void {
    if (data.crate === this.gameObject.id) {
      this.dispatchEvent<CrateAnimatePickUpEvent>('crate.animate-pickup', {})
    }
  }
  //#endif

  //#ifdef IS_SERVER
  private onCratePickUp({ crate }: DispatchedEvent<CrateDidPickUpEvent>): void {
    if (crate.id === this.gameObject.id) {
      this.disable()
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
}
