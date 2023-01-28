import * as seawars from '@seawars/game'
import { Box, Stack, Text } from '@chakra-ui/react'
import { useMemo, VFC } from 'react'
import { GiGunshot, GiHeavyBullets, GiShield, GiTargeted } from 'react-icons/gi'

import { Hitpoints } from '../common/Hitpoints'
import { Html } from '../common/Html'
import { Placement } from '../common/Placement'
import { StatShard } from '../common/StatShard'

export interface ShipInfoWidgetProps {
  name: string
  hitpoints: seawars.HitpointsState
  inventory: seawars.InventoryState
}

export const ShipInfoWidget: VFC<ShipInfoWidgetProps> = ({
  name,
  hitpoints,
  inventory
}) => {
  const items = useMemo(
    () => new Array(inventory.slots).fill(null).map((_, idx) => inventory.items[idx]),
    [inventory]
  )

  return (
    <Html>
      <Placement position="bottom-left">
        <Stack
          direction="row"
          color="white"
          transform="skewY(-1deg)"
          align="end"
          spacing={4}
        >
          <Stack w="300px" spacing={0.5}>
            <Stack direction="row" justify="space-between" align="start">
              <Text as="span" fontSize="lg" textTransform="uppercase">
                {name}
              </Text>
            </Stack>
            <Hitpoints current={hitpoints.current} max={hitpoints.max} />
            <Stack direction="row" w="100%" spacing={0.5} pt={2}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1}>
                  <StatShard icon={GiGunshot} tooltip="Attack damage">
                    <Text as="span">4</Text>
                  </StatShard>
                  <StatShard icon={GiHeavyBullets} tooltip="Attacks per turn">
                    <Text as="span">1</Text>
                  </StatShard>
                  <StatShard icon={GiTargeted} tooltip="Attack range">
                    <Text as="span">3</Text>
                  </StatShard>
                  <StatShard icon={GiShield} tooltip="Armor">
                    <Text as="span">2</Text>
                  </StatShard>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row">
            {items.map((item, idx) =>
              item ? (
                <Box
                  key={item.name}
                  h={12}
                  w={12}
                  bgImage={`/assets/images/${item.name}_preview.png`}
                  bgPosition="center"
                  bgSize="cover"
                  border="2px solid"
                  borderColor="white"
                  borderRadius={3}
                  boxShadow="inset 0 0 1rem rgba(0, 0, 0, 0.5)"
                />
              ) : (
                <Box key={idx} h={12} w={12} bgColor="whiteAlpha.300" borderRadius={3} />
              )
            )}
          </Stack>
        </Stack>
      </Placement>
    </Html>
  )
}
