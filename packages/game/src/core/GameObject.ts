import type { ComponentData, ComponentJsonData, ComponentState } from './Component'
import type { EventDispatcherEvent } from './EventDispatcher'
import type { Game } from './Game'
import type { GameObjectRegisteredEvent } from './GameObjectRegistry'
import type { Scene } from './Scene'

import { v4 as uuid } from 'uuid'

import { Component } from './Component'
import { EventDispatcher } from './EventDispatcher'
import { GameState } from './Game'
import { GameError } from './GameError'

export type GameObjectReadyEvent = EventDispatcherEvent<
  'gameObject.ready',
  { gameObject: GameObject }
>

export type GameObjectChildAddedEvent = EventDispatcherEvent<
  'gameObject.child-added',
  { gameObject: GameObject }
>

export type GameObjectChildRemovedEvent = EventDispatcherEvent<
  'gameObject.child-removed',
  { gameObject: GameObject }
>

export interface GameObjectEventData {
  gameObject: GameObject
}

export interface GameObjectData {
  id: string
  components?: ComponentJsonData[]
  children?: GameObjectData[]
  label?: string | null
  parent?: string | null
  tags: string[]
}

export class GameObject extends EventDispatcher {
  public static create(
    game: Game,
    data: Partial<GameObjectData>,
    ...components: Component<any>[]
  ): GameObject {
    return new GameObject(game, { id: uuid(), tags: [], ...data }, ...components)
  }

  private _parent?: GameObject

  get parent() {
    return this._parent
  }

  public readonly children: GameObject[] = []

  public readonly components: Map<ComponentData['name'], Component<any>> = new Map()

  public readonly game: Game

  public readonly id: GameObjectData['id']

  public readonly label?: GameObjectData['label']

  public readonly tags: Set<string>

  constructor(
    game: Game,
    { id, label, parent, tags = [] }: GameObjectData,
    ...components: Component<ComponentState>[]
  ) {
    super()

    this.id = id
    this.label = label
    this.tags = new Set<string>(tags)

    this.game = game
    this.getActiveScene().gameObjects.register(this)

    this.registerComponents(components)
    // We call `setParent` after registering our components, to guarantee they receive `GameObjectParentReceivedEvent`.
    this.setParent(parent)
    this.dispatchEvent<GameObjectReadyEvent>('gameObject.ready', { gameObject: this })
  }

  public getActiveScene(): Scene {
    return this.game.sceneManager.activeScene
  }

  /**
   * Be careful with adding children. Adding children during runtime can cause jitter.
   *
   * @param gameObject
   */
  public addChild(gameObject: GameObject): void {
    const idx = this.children.findIndex(({ id }) => id === gameObject.id)

    if (idx < 0) {
      gameObject._parent = this
      this.children.push(gameObject)
    }

    if (this.game.state === GameState.Running) {
      this.getActiveScene().dispatchEvent<GameObjectChildAddedEvent>(
        'gameObject.child-added',
        { gameObject }
      )
    }
  }

  /**
   * Be careful with removing children. Removing children during runtime can cause jitter.
   *
   * @param id
   */
  public removeChild(id: GameObject['id']): void {
    const idx = this.children.findIndex(gameObject => id === gameObject.id)

    if (idx > -1) {
      this.children[idx]._parent = undefined
      this.children.splice(idx, 1)
    }

    if (this.game.state === GameState.Running) {
      this.getActiveScene().dispatchEvent<GameObjectChildRemovedEvent>(
        'gameObject.child-removed',
        {
          gameObject: this
        }
      )
    }
  }

  public removeFromParent(): void {
    this.parent?.removeChild(this.id)
  }

  public getComponent<T extends Component<any>>(name: T['name']): T | undefined {
    return this.components.get(name) as T | undefined
  }

  public getComponentById<T extends Component<any>>(id: T['id']): T | undefined {
    return this.getComponentList().find(component => component.id === id) as T | undefined
  }

  public getComponentList() {
    const components: Component<any>[] = []

    for (const [, component] of [...this.components]) {
      components.push(component)
    }

    return components
  }

  public getChildrenByComponentName(name: string): GameObject[] {
    return this.children.filter(gameObject => gameObject.components.has(name))
  }

  public getChildrenByTag(tag: string): GameObject[] {
    const findChildren = (gameObject: GameObject, foundChildren: GameObject[]) => {
      gameObject.children.forEach(child => {
        const found = child.tags.has(tag)

        if (!found) {
          return findChildren(child, foundChildren)
        }

        //? Do we have to check, if the gameObject already exists in `foundChildren`?
        //? I think we can skip the check, because it should never be the case (or should it?)
        foundChildren.push(child)
      })

      return foundChildren
    }

    return findChildren(this, [])
  }

  public getParentByTag(tag: string): GameObject | undefined {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let currentGameObject: GameObject | undefined = this
    let done = false
    let i = 0

    while (!done) {
      done = !!currentGameObject?.parent?.tags.has(tag)
      currentGameObject = currentGameObject?.parent

      i++

      // To prevent infinite loops, we stop when 100 iterations are done
      if (i === 100) {
        done = true
      }
    }

    if (currentGameObject?.id === this.id) {
      currentGameObject = undefined
    }

    return currentGameObject
  }

  public toJSON(withChildren = false): GameObjectData {
    const result: GameObjectData = {
      id: this.id,
      label: this.label,
      parent: this.parent?.id,
      tags: [...this.tags],
      components: this.getComponentList().map(component => component.toJSON())
    }

    if (withChildren) {
      result.children = this.children.map(child => child.toJSON())
    }

    return result
  }

  private setParent(parent: GameObjectData['parent']): void {
    if (parent) {
      this._parent = this.getActiveScene().gameObjects.get(parent)

      if (this._parent) {
        this._parent.addChild(this)
      } else {
        const unsubscribe =
          this.getActiveScene().gameObjects.addEventListener<GameObjectRegisteredEvent>(
            'gameObject.registered',
            event => {
              if (event.gameObject.id === parent) {
                this.setParent(parent)
                unsubscribe()
              }
            }
          )
      }
    }
  }

  private registerComponents(components: Component<any>[]): void {
    components.forEach(component => {
      component.gameObject = this
      this.components.set(component.name, component)
    })
  }
}
