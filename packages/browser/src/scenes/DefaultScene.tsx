import { withRender } from 'core/Game'
import { withScene } from 'core/withScene'

export const DefaultScene = withRender(
  withScene(() => {
    return null
  })
)
