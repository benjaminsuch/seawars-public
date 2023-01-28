import type { StoreApi } from 'zustand'

import type { DispatchedEvent } from './EventDispatcher'
import type { GameStartedEvent, GameStoppedEvent } from './Game'
import type { GameObjectRegisteredEvent } from './GameObjectRegistry'

import createStore from 'zustand/vanilla'

import { EventDispatcher } from './EventDispatcher'
import { Game } from './Game'
import { GameObject } from './GameObject'
import { GameObjectRegistry } from './GameObjectRegistry'

export interface SceneState {
  gameObjects: GameObject[]
}

export class Scene extends EventDispatcher {
  protected readonly game: Game

  public readonly gameObjects: GameObjectRegistry = new GameObjectRegistry()

  public readonly store: StoreApi<SceneState> = createStore<SceneState>(() => ({
    gameObjects: []
  }))

  public readonly name: string

  constructor(game: Game, name: Scene['name']) {
    super()

    this.game = game
    this.name = name

    this.gameObjects.addEventListener<GameObjectRegisteredEvent>(
      'gameObject.registered',
      this.onGameObjectRegistered.bind(this)
    )
    this.game.addEventListener<GameStartedEvent>(
      'game.started',
      this.onGameStarted.bind(this)
    )
    this.game.addEventListener<GameStoppedEvent>(
      'game.stopped',
      this.onGameStopped.bind(this)
    )
  }

  /**
   * Called before components execute their `onGameObjectRegistered`.
   *
   * Please note: If you override it by a sub-class, don't forget to call `super.onGameObjectRegistered`.
   *
   * @param event
   */
  private onGameObjectRegistered({
    gameObject
  }: DispatchedEvent<GameObjectRegisteredEvent>): void {
    this.store.setState(state => {
      const idx = state.gameObjects.indexOf(gameObject)

      if (idx > -1) {
        console.warn(
          `Game: Attempt to add a gameobject canceled. Gameobject with id "${gameObject.id}" already exists.`
        )
        return
      }

      return { gameObjects: state.gameObjects.concat(gameObject) }
    })

    // We re-dispatch the same event to make sure the scene logic has priority before gameobjects
    // or components execute their logic. It's olso shorter to add a listener via `getActiveScene()`.
    //
    // While it is possible to listen to `this.gameObjects` directly, there is no guarantee that
    // the scene is up to date and behavior can change depending on what code you execute in this callback.
    this.dispatchEvent<GameObjectRegisteredEvent>('gameObject.registered', { gameObject })
  }

  protected onGameStarted(): void {}

  protected onGameStopped(): void {}
}
