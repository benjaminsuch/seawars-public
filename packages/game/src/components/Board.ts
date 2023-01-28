import type { ComponentState } from '../core/Component'
import type { GameObject } from '../core/GameObject'
import type { PositionComponent } from './Position'

import { v4 as uuid } from 'uuid'

import { Component } from '../core/Component'
import { GameError } from '../core/GameError'

export interface BoardState extends ComponentState {
  columns: number
  rows: number
}

export type BoardComponentCreateData = Pick<BoardState, 'columns' | 'rows'> &
  Partial<Omit<BoardState, 'columns' | 'rows'>>

export class BoardComponent extends Component<BoardState> {
  public static readonly FIELD_SIZE_X = 100

  public static readonly FIELD_SIZE_Z = 100

  public static readonly FIELD_SPACER = 5

  public static create(data: BoardComponentCreateData) {
    return new BoardComponent(uuid(), { isDisabled: false, ...data })
  }

  constructor(id: BoardComponent['id'], state: BoardState) {
    super({ id, name: 'Board' }, state)
  }

  public getGameObjectsByPosition(x: number, y: number): GameObject[] {
    const list: GameObject[] = []

    for (const gameObject of this.getActiveScene().gameObjects.getGameObjectsByComponent(
      'Position'
    )) {
      const state = this.getPositionComponent(gameObject).getState()

      if (x === state.x && y === state.y) {
        list.push(gameObject)
      }
    }

    return list
  }

  public getGameObjectsInRange(
    [minX, maxX]: [number, number],
    [minY, maxY]: [number, number]
  ): GameObject[] {
    return this.getActiveScene()
      .gameObjects.getGameObjectsByComponent('Position')
      .filter(field => {
        const { x, y } = this.getPositionComponent(field).getState()
        const rangeX = x >= minX && x <= maxX
        const rangeY = y >= minY && y <= maxY

        return rangeX && rangeY
      })
  }

  private getPositionComponent(
    gameObject: GameObject = this.gameObject
  ): PositionComponent {
    const position = gameObject.getComponent<PositionComponent>('Position')

    if (!position) {
      throw new GameError(
        `BoardComponent: Gameobject (${[
          ...gameObject.tags.values()
        ]}) does not have 'PositionComponent'.`
      )
    }

    return position
  }
}
