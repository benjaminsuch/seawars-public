import type { Game } from '../core/Game'

import { Scene } from '../core/Scene'

export class BattlefieldScene extends Scene {
  constructor(game: Game) {
    super(game, 'Battlefield')
  }

  protected onGameStarted(): void {}
}
