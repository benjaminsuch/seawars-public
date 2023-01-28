import type { VFC } from 'react'

import * as seawars from '@seawars/game'
import { Box, Icon, Stack, Text } from '@chakra-ui/react'
import { GiBottomRight3DArrow, GiCancel, GiGunshot } from 'react-icons/gi'

import { useGunAttackStore } from 'components/GunAttack'
import { useHitpointsStore } from 'components/Hitpoints'
import { useInventoryStore } from 'components/Inventory'
import { useMoveableStore } from 'components/Moveable'
import { useSelectableStore } from 'components/Selectable'
import { useShipStore } from 'components/Ship'
import { useGameObject } from 'core/GameObject'
import { useStore } from 'core/useStore'
import { getMatch } from 'scenes/Battlefield'
import { AbilityButton, AbilityButtonProps, Hitpoints, Html, Placement } from 'ui/common'
import { useUserContext } from 'ui/UserProvider'
import { ShipInfoWidget } from './ShipInfo'

export interface ShipOverlayWidgetProps {}

export const ShipOverlayWidget: VFC<ShipOverlayWidgetProps> = ({}) => {
  const hitpoints = useHitpointsStore()
  const inventory = useInventoryStore()
  const { name } = useShipStore()
  const { isSelected } = useSelectableStore()

  return (
    <>
      <group position={[0, 35, 0]}>
        <Html center distanceFactor={400}>
          <Stack w="56" spacing={0} pointerEvents="none">
            <Stack direction="row" align="center" spacing={1}>
              <Text
                as="span"
                position="relative"
                color="white"
                textShadow="1px 1px 0 #000"
                fontSize="xl"
                textTransform="uppercase"
                whiteSpace="nowrap"
                pl={0.5}
              >
                {name}
              </Text>
            </Stack>
            <Box w="100%" p={0.5} bgColor="blackAlpha.700" borderRadius={1}>
              <Hitpoints
                current={hitpoints.current}
                max={hitpoints.max}
                height={2}
                spacing={0.5}
              />
            </Box>
          </Stack>
        </Html>
      </group>
      {isSelected && (
        <>
          <ShipInfoWidget name={name} hitpoints={hitpoints} inventory={inventory} />
          <Actions />
        </>
      )}
    </>
  )
}

interface AbilityProps<T, S> {
  component: T
  state: S
}

interface MoveAbilityProps
  extends AbilityProps<seawars.MoveableComponent, seawars.MoveableState>,
    Omit<AbilityButtonProps, 'icon' | 'onPointerUp'> {}

const MoveAbility: VFC<MoveAbilityProps> = ({
  component,
  isDisabled,
  state,
  ...props
}) => {
  const { isActive } = state

  const handlePointerUp = () => {
    try {
      if (isActive) {
        component.cancel()
      } else {
        component.start()
      }
    } catch (error) {
      console.warn(error)
    }
  }

  if (!component.isOwner) {
    return null
  }

  return (
    <AbilityButton
      {...props}
      isDisabled={isDisabled || !component.canMove()}
      icon={
        <Icon
          as={isActive ? GiCancel : GiBottomRight3DArrow}
          fontSize="3xl"
          transform="rotate(-90deg)"
        />
      }
      onPointerUp={handlePointerUp}
    />
  )
}

interface GunAttackAbilityProps
  extends AbilityProps<seawars.GunAttackComponent, seawars.GunAttackState>,
    Omit<AbilityButtonProps, 'icon' | 'onPointerUp'> {}

const GunAttackAbility: VFC<GunAttackAbilityProps> = ({
  component,
  isDisabled,
  state,
  ...props
}) => {
  const { isActive } = state

  const handlePointerUp = () => {
    try {
      if (isActive) {
        component.cancel()
      } else {
        component.start()
      }
    } catch (error) {
      console.warn(error)
    }
  }

  if (!component.isOwner) {
    return null
  }

  return (
    <AbilityButton
      {...props}
      isDisabled={isDisabled || !component.canAttack()}
      color="red"
      icon={<Icon as={isActive ? GiCancel : GiGunshot} fontSize="3xl" />}
      onPointerUp={handlePointerUp}
    />
  )
}

const Actions = () => {
  const match = getMatch()
  const user = useUserContext()
  const { activePlayer } = useStore(match.store)
  const { gameObject } = useGameObject()

  const moveableComponent = gameObject.getComponent<seawars.MoveableComponent>('Moveable')
  const moveableState = useMoveableStore()

  const gunAttackComponent =
    gameObject.getComponent<seawars.GunAttackComponent>('GunAttack')
  const gunAttackState = useGunAttackStore()

  const isActivePlayer = user.id === activePlayer

  return (
    <Html>
      <Placement position="bottom">
        <Stack direction="row">
          {gunAttackComponent && (
            <GunAttackAbility
              isDisabled={!isActivePlayer}
              component={gunAttackComponent}
              state={gunAttackState}
            />
          )}
          {moveableComponent && (
            <MoveAbility
              isDisabled={!isActivePlayer}
              component={moveableComponent}
              state={moveableState}
            />
          )}
        </Stack>
      </Placement>
    </Html>
  )
}
