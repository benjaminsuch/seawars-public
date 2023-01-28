import { defaultGenerator } from '../../src/common/IdGenerator'
import { ArmorComponent, ArmorData } from '../../src/components/Armor'
import { HealthComponent, HealthData } from '../../src/components/Health'
import { GunComponent, GunData } from '../../src/components/Gun'
import { MoveableComponent, MoveableComponentState } from '../../src/components/Moveable'
import { PositionComponent, PositionData } from '../../src/components/Position'
import { SelectableComponent, SelectableData } from '../../src/components/Selectable'
import { TargetComponent, TargetData } from '../../src/components/Target'

export const createGun = (data?: Partial<GunData>) =>
  new GunComponent(defaultGenerator.nextId(), { isDisabled: false, damage: 3, ...data })

export const createMoveable = (data?: Partial<MoveableComponentState>) =>
  new MoveableComponent(defaultGenerator.nextId(), {
    movementsDone: 0,
    movementsPerTurn: 1,
    isActive: false,
    isDisabled: false,
    range: [1, 1],
    ...data
  })

export const createTarget = (data?: Partial<TargetData>) =>
  new TargetComponent(defaultGenerator.nextId(), { isDisabled: false, ...data })

export const createArmor = (data?: Partial<ArmorData>) =>
  new ArmorComponent(defaultGenerator.nextId(), {
    isDisabled: false,
    armor: 1,
    isDestroyed: false,
    ...data
  })

export const createPosition = (data?: Partial<PositionData>) =>
  new PositionComponent(defaultGenerator.nextId(), {
    isDisabled: false,
    x: 1,
    y: 1,
    ...data
  })

export const createSelectable = (data?: Partial<SelectableData>) =>
  new SelectableComponent(defaultGenerator.nextId(), {
    isDisabled: false,
    isSelected: false,
    style: {},
    ...data
  })

export const createHealth = (data?: Partial<HealthData>) =>
  new HealthComponent(defaultGenerator.nextId(), {
    maxHitpoints: 8,
    currentHitpoints: 8,
    isInvulnerable: false,
    isDisabled: false,
    ...data
  })
