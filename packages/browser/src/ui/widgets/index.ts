import { CrateInfoWidget } from './CrateInfo'
import { ShipOverlayWidget } from './ShipOverlay'

export * from './Countdown'
export * from './PlayerVitals'

const widgets = { CrateInfoWidget, ShipOverlayWidget }

export const getWidgetComponent = (name?: string) => {
  if (!name || !widgets[name]) {
    throw new Error(`Cannot load unknown widget "${name}".`)
  }
  return widgets[name] as typeof widgets[keyof typeof widgets]
}
