import * as THREE from 'three'
import { FC, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export interface RotationProps {
  axis?: 'x' | 'y' | 'z'
  isDisabled?: boolean
  speed?: number
}

export const Rotation: FC<RotationProps> = ({
  children,
  axis = 'y',
  isDisabled,
  speed = 0.01
}) => {
  const ref = useRef<THREE.Group>()

  useFrame(() => {
    if (ref.current && !isDisabled) {
      ref.current.rotation[axis] += speed
    }
  })

  return <group ref={ref}>{children}</group>
}
