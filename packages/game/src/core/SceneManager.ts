import type { Class } from '../types'
import type { EventDispatcherEvent } from './EventDispatcher'

import { EventDispatcher } from './EventDispatcher'
import { Game } from './Game'
import { GameError } from './GameError'
import { Scene } from './Scene'

export type SceneManagerSceneLoadedEvent = EventDispatcherEvent<
  'sceneManager.scene-loaded',
  { scene: Scene }
>

export type SceneManagerActiveSceneUnloaded = EventDispatcherEvent<
  'sceneManager.active-scene-unloaded',
  undefined
>

export class SceneManager extends EventDispatcher {
  private readonly game: Game

  private _activeScene: Scene

  get activeScene() {
    return this._activeScene
  }

  public readonly scenes: Map<Scene['name'], Scene> = new Map()

  constructor(game: Game) {
    super()

    this.game = game
    this._activeScene = new Scene(game, 'DefaultScene')
  }

  /**
   * Loading another scene will automatically unload the current active scene.
   * It will wait until all closing events have been executed before eventually
   * assigning the new scene.
   *
   * @param scene - The class of the scene you want to load.
   */
  public loadScene(SceneClass: Class<Scene>) {
    const scene = new SceneClass(this.game)

    if (this.activeScene === scene) {
      throw new GameError(
        `Game: Unable open scene (${scene.name}). Scene is already active.`
      )
    }

    if (!this.scenes.has(scene.name)) {
      this.scenes.set(scene.name, scene)
    }

    this.unloadActiveScene()
    this._activeScene = scene
    this.dispatchEvent<SceneManagerSceneLoadedEvent>('sceneManager.scene-loaded', {
      scene: scene
    })
  }

  /**
   * Unloading a scene won't be a public method because there must be at least
   * one scene active and we want to prevent the developer for accidentically
   * have no active scene.
   */
  private unloadActiveScene() {
    // Remove all event listeners
    this.activeScene.flush()
    this.dispatchEvent<SceneManagerActiveSceneUnloaded>(
      'sceneManager.active-scene-unloaded',
      undefined
    )
  }
}
