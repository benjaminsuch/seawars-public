import type { StoreApi } from 'zustand'

import type { DispatchedEvent, EventDispatcherEvent } from './EventDispatcher'
import type { GameTickOptions } from './Game'
import type {
  GameObject,
  GameObjectChildAddedEvent,
  GameObjectChildRemovedEvent,
  GameObjectReadyEvent
} from './GameObject'
import type { GameObjectRegisteredEvent } from './GameObjectRegistry'
import type { Scene } from './Scene'

import createStore from 'zustand/vanilla'

import { defaultGenerator } from '../common/IdGenerator'
import { EventDispatcher } from './EventDispatcher'
import { GameError } from './GameError'

export type ComponentEnabledEvent = EventDispatcherEvent<
  'component.enabled',
  { component: Component<any> }
>

export type ComponentDisabledEvent = EventDispatcherEvent<
  'component.disabled',
  { component: Component<any> }
>

export interface ComponentState {
  isDisabled: boolean
}

export interface ComponentData {
  name: string
  id: string
}

export interface ComponentJsonData<T extends ComponentState = any> extends ComponentData {
  //TODO: `isOwner` and `ownerId` belong to the `NetworkComponentJsonData` type, but we don't have that type yet.
  isOwner?: boolean
  ownerId?: string
  state: T
}

export interface ComponentEventData<Data, C = Component<any>>
  extends Omit<ComponentState, 'isDisabled'> {
  component: C
  data: Data
}

/**
 * Order of gameobject events:
 *
 * 1. onGameObjectAssigned
 * 2. onGameObjectReady
 * 3. onGameObjectRegistered
 */
export abstract class Component<State extends ComponentState> extends EventDispatcher {
  private _gameObject?: GameObject

  get gameObject(): GameObject {
    if (!this._gameObject) {
      throw new GameError(`Component: Not attached to a gameobject.`)
    }
    return this._gameObject
  }

  set gameObject(val: GameObject | undefined) {
    if (!val) {
      throw new GameError(`Component: Cannot assign undefined to 'this.gameObject'.`)
    }
    if (this._gameObject) {
      throw new GameError(`Component: Cannot override gameobject.`)
    }

    this._gameObject = val
    this.onGameObjectAssigned()

    this._gameObject.addEventListener<GameObjectReadyEvent>(
      'gameObject.ready',
      this.onGameObjectReady.bind(this)
    )
  }

  public readonly store: StoreApi<State>

  public readonly name: ComponentData['name']

  public readonly id: ComponentData['id']

  /**
   * Be mindful when constructing an instance. The more logic you execute here, the longer
   * it takes to spawn the game object.
   *
   * @param data
   * @param state
   */
  constructor({ name, id }: ComponentData, state: State) {
    super()

    this.name = name
    this.id = id ?? defaultGenerator.nextId()
    this.store = createStore<State>(() => state)
    this.store.subscribe(this.onStoreUpdate.bind(this))
  }

  public getActiveScene(): Scene {
    return this.gameObject.getActiveScene()
  }

  /**
   * Choose carefully what you put into the update function as it runs every frame.
   *
   * Usually a component doesn't need the update function, as the gameplay is mostly
   * event-based. But in case you actually need it, please read the following guidelines.
   *
   * 1. Avoid loops (they are expensive) and if you can't, be mindful with what you loop through.
   * - Always use an array. Casting a map to an array will cost performance and a Set is also much slower.
   * - Don't put console messages in here.
   * - Use breakable loops.
   *
   * @param options
   */
  public update(options: GameTickOptions): void {}

  public enable(): void {
    const { isDisabled } = this.getState()

    if (isDisabled) {
      this.store.setState({ isDisabled: false })
      this.getActiveScene().dispatchEvent<ComponentEnabledEvent>('component.enabled', {
        component: this
      })
    }
  }

  public disable(): void {
    const { isDisabled } = this.getState()

    if (!isDisabled) {
      this.store.setState({ isDisabled: true })
      this.getActiveScene().dispatchEvent<ComponentDisabledEvent>('component.disabled', {
        component: this
      })
    }
  }

  public getState(): State {
    return this.store.getState()
  }

  public isOrigin(component: Component<any>): boolean {
    return component.gameObject?.id === this.gameObject?.id
  }

  public toJSON(): any /* ComponentData & { state: Data } */ {
    return {
      id: this.id,
      name: this.name,
      state: this.getState()
    }
  }

  /**
   * This callback is called right after the gameobject has been assigned to
   * `this.gameObject`. Be aware that not all components have been registered yet
   * and that the parent is also not set yet.
   *
   * It's a good place to initialize logic before `onGameObjectReady` is called.
   *
   * Please note: Is only called for the gameobject of component's instance.
   */
  protected onGameObjectAssigned(): void {}

  /**
   * This is called after the gameobject initialization has been completed. At
   * this point all components and the parent are available.
   *
   * Please note: Is only called for the gameobject of component's instance.
   */
  protected onGameObjectReady(): void {
    this.getActiveScene().addEventListener<GameObjectRegisteredEvent>(
      'gameObject.registered',
      this.onGameObjectRegistered.bind(this)
    )

    this.getActiveScene().addEventListener<GameObjectChildAddedEvent>(
      'gameObject.child-added',
      this.onChildAdded.bind(this)
    )

    this.getActiveScene().addEventListener<GameObjectChildRemovedEvent>(
      'gameObject.child-removed',
      this.onChildRemoved.bind(this)
    )
  }

  /**
   * Gets called when a gameobject has been registered and after the active scene
   * has executed it's `onGameReady` logic.
   *
   * Please note: This event happens after `onGameObjectReady` and gets called for
   * _any_ gameobject that is being registered.
   *
   * @param event
   */
  protected onGameObjectRegistered(
    event: DispatchedEvent<GameObjectRegisteredEvent>
  ): void {}

  protected onGameObjectDestroyed(): void {}

  /**
   * Called, when GameObject receives a new child.
   */
  protected onChildAdded(data: GameObjectChildAddedEvent['data']): void {}

  /**
   * Called, when GameObject loses a child.
   */
  protected onChildRemoved(data: GameObjectChildRemovedEvent['data']): void {}

  protected onStoreUpdate(state: State): void {}
}
