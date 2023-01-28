import { EventDispatcherEvent } from './EventDispatcher'
import type { GameObject, GameObjectData } from './GameObject'

import { defaultGenerator } from '../common/IdGenerator'
import { EventDispatcher } from './EventDispatcher'
import { GameError } from './GameError'
import { SceneManager } from './SceneManager'

export type GameStartedEvent = EventDispatcherEvent<'game.started', undefined>

export type GameStoppedEvent = EventDispatcherEvent<'game.stopped', undefined>

export enum GameState {
  Idle = 0,
  Started = 1,
  Running = 2,
  Stopped = 3
}

export interface GameConfig {}

export interface GameTickOptions {
  delta: number
  elapsedTime: number
}

export interface GameJsonData {
  config: GameConfig
  gameObjects: GameObjectData[]
}

export interface GameStore {
  gameObjects: GameObject[]
}

export class Game extends EventDispatcher {
  private static _instance?: Game

  /**
   * Gets the latest instance of "Game", useful on the client side (since
   * there should be only one instance running in one tab).
   */
  public static instance(): Game {
    if (!this._instance) {
      throw new GameError(`Gmae: No instance available.`)
    }
    return this._instance
  }

  private _state: GameState = GameState.Idle

  get state() {
    return this._state
  }

  public readonly config: GameConfig = {}

  public readonly id: string

  public readonly sceneManager: SceneManager

  constructor(data: Partial<GameJsonData> = {}, onCreate?: (game: Game) => void) {
    super()

    this.id = defaultGenerator.nextId()
    this.config = { ...this.config, ...data.config }
    this.sceneManager = new SceneManager(this)

    if (IS_CLIENT) {
      Game._instance = this
    }

    onCreate?.(this)
  }

  public start(): void {
    if (this.state !== GameState.Idle) {
      console.warn(`Cannot start game while it's running.`)
      return
    }

    this._state = GameState.Running
    this.dispatchEvent<GameStartedEvent>('game.started', undefined)
  }

  public stop(): void {
    if (this.state !== GameState.Running) {
      console.warn(`Cannot stop game. Game is not running.`)
      return
    }

    this._state = GameState.Idle
    this.dispatchEvent<GameStoppedEvent>('game.stopped', undefined)
  }

  /**
   * Should be called inside `requestAnimationFrame` or a similar function.
   */
  public requestTick(options: GameTickOptions): void {
    this.update(options)
  }

  private update(options: GameTickOptions): void {
    const gameObjects = this.sceneManager.activeScene.gameObjects.getList()

    for (const gameObject of gameObjects) {
      for (const component of gameObject.getComponentList()) {
        component.update(options)
      }
    }
  }
}
