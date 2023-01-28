import { inputAnatomy as parts } from '@chakra-ui/anatomy'
import type { PartsStyleObject, SystemStyleObject } from '@chakra-ui/theme-tools'

const size: Record<string, SystemStyleObject> = {
  lg: {
    borderRadius: 0
  },
  md: {
    borderRadius: 0
  },
  sm: {
    borderRadius: 0
  },
  xs: {
    borderRadius: 0
  }
}

const sizes: Record<string, PartsStyleObject<typeof parts>> = {
  lg: {
    field: size.lg,
    addon: size.lg
  },
  md: {
    field: size.md,
    addon: size.md
  },
  sm: {
    field: size.sm,
    addon: size.sm
  },
  xs: {
    field: size.xs,
    addon: size.xs
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { sizes }
