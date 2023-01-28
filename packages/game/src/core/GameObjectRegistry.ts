import type { EventDispatcherEvent } from './EventDispatcher'
import type { GameObject } from './GameObject'

import { EventDispatcher } from './EventDispatcher'

export type GameObjectRegisteredEvent = EventDispatcherEvent<
  'gameObject.registered',
  { gameObject: GameObject }
>

export type GameObjectMap = Map<GameObject['id'], GameObject>

export class GameObjectRegistry extends EventDispatcher {
  private readonly list: GameObject[] = []

  private readonly map: GameObjectMap = new Map()

  public register(gameObject: GameObject): void {
    this.list.push(gameObject)
    this.map.set(gameObject.id, gameObject)
    this.dispatchEvent<GameObjectRegisteredEvent>('gameObject.registered', { gameObject })
  }

  public get(id: GameObject['id']): GameObject | undefined {
    return this.map.get(id)
  }

  public getList(): GameObject[] {
    return this.list
  }

  public getGameObjectsByComponent(name: string): GameObject[] {
    const gameObjects: GameObject[] = []

    for (const gameObject of this.list) {
      if (gameObject.components.has(name)) {
        gameObjects.push(gameObject)
      }
    }

    return gameObjects
  }

  public getGameObjectsByTags(tags: [string, ...string[]]) {
    const gameObjects: GameObject[] = []

    for (const gameObject of this.list) {
      if (tags.every(tag => gameObject.tags.has(tag))) {
        gameObjects.push(gameObject)
      }
    }

    return gameObjects
  }
}
