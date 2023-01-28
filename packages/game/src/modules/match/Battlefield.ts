import type { Game } from '../../core/Game'

import { BoardComponent } from '../../components/Board'
import { FieldComponent } from '../../components/Field'
import { ModelComponent } from '../../components/Model'
import { NetworkObjectComponent } from '../../components/NetworkObject'
import { PositionComponent } from '../../components/Position'
import { SelectableComponent } from '../../components/Selectable'
import { TransformComponent } from '../../components/Transform'
import { GameError } from '../../core/GameError'
import { GameObject } from '../../core/GameObject'

export interface BattlefieldData {
  name: string
  label: string
  description?: string
  x: number
  y: number
  minPlayers: number
  maxPlayers: number
}

export class Battlefield {
  public static readonly PACIFIC_OCEAN: Battlefield = new Battlefield({
    name: 'pacific_ocean',
    label: 'Pacific Ocean',
    x: 24, //12,
    y: 16, //4,
    minPlayers: 2,
    maxPlayers: 2
  })

  public static readonly DEFAULT_BATTLEFIELD: Battlefield = Battlefield.PACIFIC_OCEAN

  private board?: GameObject

  public readonly name: BattlefieldData['name']

  public readonly label: BattlefieldData['label']

  public readonly description?: BattlefieldData['description']

  public readonly x: BattlefieldData['x']

  public readonly y: BattlefieldData['y']

  public readonly minPlayers: BattlefieldData['minPlayers']

  public readonly maxPlayers: BattlefieldData['maxPlayers']

  constructor(data: BattlefieldData) {
    const { name, label, description, x, y, minPlayers, maxPlayers } = data

    if (x < 12 || y < 9) {
      //throw new GameError(`Your battlefield must have a minimum size of 16x9.`)
    }

    if (maxPlayers > 2) {
      throw new GameError(`We currently only support max. players of 2.`)
    }

    this.name = name
    this.label = label
    this.description = description
    this.x = x
    this.y = y
    this.minPlayers = minPlayers
    this.maxPlayers = maxPlayers
  }

  public createBoard(game: Game): GameObject {
    if (this.board) {
      return this.board
    }

    const board = GameObject.create(
      game,
      { tags: ['board'] },
      TransformComponent.create(),
      BoardComponent.create({ rows: this.x, columns: this.y }),
      ModelComponent.create({ name: 'Board' }),
      NetworkObjectComponent.create()
    )

    const fieldSize = BoardComponent.FIELD_SIZE_X + BoardComponent.FIELD_SPACER
    let index = 0

    for (let i = 0; i < this.x; i++) {
      for (let j = 0; j < this.y; j++) {
        const x = fieldSize * i - fieldSize * (this.x / 2)
        const y = fieldSize * j - fieldSize * (this.y / 2)

        GameObject.create(
          game,
          { parent: board.id, tags: ['field'] },
          TransformComponent.create({
            position: [x, 0.25, y],
            rotation: [-(Math.PI / 2), 0, 0]
          }),
          ModelComponent.create({ name: 'Field' }),
          PositionComponent.create({ x: i, y: j }),
          SelectableComponent.create({ isDisabled: true }),
          FieldComponent.create({ index: index++ }),
          NetworkObjectComponent.create()
        )
      }
    }

    this.board = board

    return board
  }

  public getStartingFields(): GameObject[][] {
    if (!this.board) {
      throw new GameError(`Battlefield: You have to create a board first.`)
    }

    const shipCount = 5
    const startingAreaSizeX = shipCount + 2
    const startingAreaSizeY = 2
    const spaceX = Math.floor((this.x - startingAreaSizeX) / 2)
    const spaceY = this.y - startingAreaSizeY

    const startingFields: GameObject[][] = []
    const positionFns: Array<(x: number, y: number) => boolean> = [
      (x, y) => y >= spaceY && x > spaceX && x < startingAreaSizeX + spaceX,
      (x, y) => y < this.y - spaceY && x > spaceX && x < startingAreaSizeX + spaceX
    ]

    for (let i = 0; i < this.maxPlayers; i++) {
      if (!startingFields[i]) {
        startingFields[i] = []
      }

      startingFields[i] = this.getFieldsWithinPosition(
        this.board.children,
        positionFns[i]
      )

      for (const field of startingFields[i]) {
        field
          .getComponent<FieldComponent>('Field')
          ?.store.setState({ isStartingField: true })
      }
    }

    return startingFields
  }

  public getItemFields(): GameObject[] {
    if (!this.board) {
      throw new GameError(`Battlefield: You have to create a board first.`)
    }

    const fields: GameObject[] = []

    for (const field of this.board.getChildrenByComponentName('Field')) {
      const state = field.getComponent<FieldComponent>('Field')?.getState()

      if (!state?.isStartingField) {
        fields.push(field)
      }
    }

    return fields
  }

  public toJSON(): BattlefieldData {
    return {
      name: this.name,
      label: this.label,
      description: this.description,
      x: this.x,
      y: this.y,
      minPlayers: this.minPlayers,
      maxPlayers: this.maxPlayers
    }
  }

  private getFieldsWithinPosition(
    fields: GameObject[],
    handler: (x: number, y: number) => boolean
  ): GameObject[] {
    return fields.filter(field => {
      const position = field.getComponent<PositionComponent>('Position')
      const { x = 0, y = 0 } = position?.getState() ?? {}

      return handler(x, y)
    })
  }
}
