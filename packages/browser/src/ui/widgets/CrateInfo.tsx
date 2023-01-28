import * as seawars from '@seawars/game'
import { Box, Icon, Stack, Text } from '@chakra-ui/react'
import { useMemo, VFC } from 'react'
import {
  GiArrowDunk,
  GiBullets,
  GiCardboardBoxClosed,
  GiEyeTarget,
  GiGooeyImpact,
  GiGunshot,
  GiShield,
  GiWalkingBoot
} from 'react-icons/gi'

import { useCrateStore } from 'components/Crate'
import { useSelectableStore } from 'components/Selectable'
import { Html } from '../common/Html'
import { Placement } from '../common/Placement'

export interface CrateInfoWidgetProps {}

export const CrateInfoWidget: VFC<CrateInfoWidgetProps> = () => {
  const { item } = useCrateStore()
  const { isSelected } = useSelectableStore()

  if (!isSelected) {
    return null
  }

  return (
    <Html>
      <Placement position="bottom-left">
        <Stack
          color="white"
          transform="skewY(-1deg)"
          minW="450px"
          maxH="250px"
          bgColor="blackAlpha.300"
          backdropFilter="auto"
          backdropBlur="8px"
          spacing={3}
          borderTop="1px solid"
          borderBottom="1px solid"
          borderColor="whiteAlpha.300"
        >
          <Box bgColor="blackAlpha.500" px={3} py={1}>
            <Text as="span" fontSize="lg" textTransform="uppercase">
              {item?.label}
            </Text>
          </Box>
          <Stack w="100%" direction="row" spacing={3} p={3} pt={0}>
            <Box
              h={100}
              w={100}
              bgImage={`/assets/images/${item?.name}_preview.png`}
              bgPosition="center"
              opacity={0.75}
            />
            <Stack flex={2} overflow="hidden">
              <Text fontWeight={300}>{item?.description}</Text>
              <Stats data={item?.stats} />
            </Stack>
          </Stack>
        </Stack>
      </Placement>
    </Html>
  )
}

interface StatsProps {
  data?: seawars.ItemState['stats']
}

const Stats: VFC<StatsProps> = ({ data = {} }) => {
  const chunks = Object.entries(data).reduce<Array<[string, number][]>>(
    (result, item, _, arr) => {
      const lastChunk = result[result.length - 1]

      if (lastChunk && lastChunk.length < Math.ceil(arr.length / 2)) {
        lastChunk.push(item as [string, number])
      } else {
        result.push([item as [string, number]])
      }

      return result
    },
    []
  )

  return (
    <Stack w="100%" direction="row" spacing={4} pt={2}>
      {chunks.map((chunk, idx) => (
        <Stack w="100%" key={idx} spacing={0}>
          {chunk.map(([key, val]) => (
            <Stack
              flex={1}
              direction="row"
              justify="space-between"
              key={key}
              whiteSpace="nowrap"
            >
              <StatsLabel name={key} />
              <Text as="span" fontWeight={500}>
                {val}
              </Text>
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

interface StatsLabelProps {
  name: string
}

const StatsLabel: VFC<StatsLabelProps> = ({ name }) => {
  const [icon, label] = useMemo(() => {
    if (name === 'armor') {
      return [<Icon key={name} as={GiShield} mr={0.5} color="yellow.400" />, 'Armor']
    }
    if (name === 'charges') {
      return [
        <Icon key={name} as={GiCardboardBoxClosed} mr={0.5} color="teal.400" />,
        'Charges'
      ]
    }
    if (name === 'critChance') {
      return [
        <Icon key={name} as={GiGunshot} mr={0.5} color="orange.300" />,
        'Crit. Chance'
      ]
    }
    if (name === 'critDamage') {
      return [
        <Icon key={name} as={GiGooeyImpact} mr={0.5} color="orange.300" />,
        'Crit. Damage'
      ]
    }
    if (name === 'attackDamage') {
      return [<Icon key={name} as={GiGunshot} mr={0.5} color="red.400" />, 'Damage']
    }
    if (name === 'firerate') {
      return [<Icon key={name} as={GiBullets} mr={0.5} color="yellow.400" />, 'Firerate']
    }
    if (name === 'precision') {
      return [<Icon key={name} as={GiEyeTarget} mr={0.5} color="teal.400" />, 'Precision']
    }
    if (name === 'attackRange') {
      return [<Icon key={name} as={GiArrowDunk} mr={0.5} color="red.400" />, 'Range']
    }
    if (name === 'movement') {
      return [<Icon key={name} as={GiWalkingBoot} mr={0.5} color="blue.400" />, 'Speed']
    }

    return [null, 'n/a']
  }, [name])

  return (
    <Text
      as="span"
      color="gray.300"
      fontWeight={300}
      textTransform="capitalize"
      d="inline-flex"
      alignItems="center"
      alignSelf="start"
    >
      {icon}
      {label}:
    </Text>
  )
}
