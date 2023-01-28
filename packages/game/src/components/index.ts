import { BoardComponent } from './Board'
import { CrateComponent } from './Crate'
import { FieldComponent } from './Field'
import { GunAttackComponent } from './GunAttack'
import { HitpointsComponent } from './Hitpoints'
import { InventoryComponent } from './Inventory'
import { ItemComponent } from './Item'
import { ModelComponent } from './Model'
import { MoveableComponent } from './Moveable'
import { NetworkObjectComponent } from './NetworkObject'
import { PositionComponent } from './Position'
import { SelectableComponent } from './Selectable'
import { ShipComponent } from './Ship'
import { ShipGunComponent } from './ShipGun'
import { TargetableComponent } from './Targetable'
import { TransformComponent } from './Transform'
import { WidgetComponent } from './Widget'

const components = {
  BoardComponent,
  CrateComponent,
  FieldComponent,
  GunAttackComponent,
  HitpointsComponent,
  InventoryComponent,
  ItemComponent,
  ModelComponent,
  MoveableComponent,
  NetworkObjectComponent,
  PositionComponent,
  SelectableComponent,
  ShipComponent,
  ShipGunComponent,
  TargetableComponent,
  TransformComponent,
  WidgetComponent
}

export const getComponents = () => components

export const getComponentClassByName = (name: string) => {
  const component = components[`${name}Component` as keyof typeof components]
  if (!component) {
    throw `Unknown component class "${name}".`
  }
  return component
}
