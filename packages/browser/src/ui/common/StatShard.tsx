import { As, Icon, Stack, StackProps, Tooltip, TooltipProps } from '@chakra-ui/react'
import { FC } from 'react'
import { IconType } from 'react-icons'

export interface StatShardProps extends Pick<StackProps, 'bgColor'> {
  icon?: As<IconType>
  tooltip?: TooltipProps['label']
}

export const StatShard: FC<StatShardProps> = ({ children, icon, tooltip, ...props }) => (
  <Tooltip label={tooltip}>
    <Stack
      direction="row"
      align="center"
      justify="center"
      spacing={1}
      bgColor="blackAlpha.300"
      backdropFilter="auto"
      backdropBlur="10px"
      borderRadius={2}
      border="1px solid"
      borderColor="whiteAlpha.300"
      h={8}
      w={12}
      {...props}
    >
      <Icon as={icon} color="whiteAlpha.600" />
      {children}
    </Stack>
  </Tooltip>
)
