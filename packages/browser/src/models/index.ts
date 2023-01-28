import { AircraftCarrier } from './AircraftCarrier'
import { Battlecruiser } from './Battlecruiser'
import { Corvette } from './Corvette'
import { Destroyer } from './Destroyer'
import { Frigate } from './Frigate'

export * from './AircraftCarrier'
export * from './Battlecruiser'
export * from './Corvette'
export * from './Destroyer'
export * from './Frigate'

import { Board } from './Board'
import { Crate } from './Crate'
import { Field } from './Field'
import { Phalanx } from './Phalanx'
import { ShipGun } from './ShipGun'

export * from './Board'
export * from './Cannon'
export * from './Crate'
export * from './Field'
export * from './Machine'
export * from './Mine'
export * from './Phalanx'
export * from './Railgun'
export * from './Shell'
export * from './ShipGun'
export * from './Torpedo'

export const models = {
  // Ships
  AircraftCarrier,
  Battlecruiser,
  Corvette,
  Destroyer,
  Frigate,
  // Other
  Board,
  Crate,
  Field,
  Phalanx,
  ShipGun
}
