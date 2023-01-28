import type { GLTF } from 'three-stdlib'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type Machine01GLTFResult = GLTF & {
  nodes: {
    device3_1: THREE.Mesh
    device3_2: THREE.Mesh
    device3_3: THREE.Mesh
  }
  materials: {
    ['device3 part1']: THREE.MeshStandardMaterial
    ['device3 part2']: THREE.MeshStandardMaterial
  }
}

type Machine02GLTFResult = GLTF & {
  nodes: {
    device42: THREE.Mesh
  }
  materials: {
    device42: THREE.MeshStandardMaterial
  }
}

const MACHINE01_PATH = '/assets/models/machine01.glb'
const MACHINE02_PATH = '/assets/models/machine02.glb'

useGLTF.preload(MACHINE01_PATH)
useGLTF.preload(MACHINE02_PATH)

export interface MachineProps {
  variant?: 'machine01' | 'machine02'
}

export const Machine = forwardRef<any, MachineProps>(({ variant = 'machine01' }, ref) => {
  if (variant === 'machine02') {
    return <Machine02 ref={ref} />
  }
  return <Machine01 ref={ref} />
})

const Machine01 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(MACHINE01_PATH) as Machine01GLTFResult

  return (
    <group ref={group} {...props} dispose={null} scale={1.5}>
      <group
        ref={ref}
        position={[0, 0.78, 1.07]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={0.01}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.device3_1.geometry}
          material={materials['device3 part1']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.device3_2.geometry}
          material={materials['device3 part2']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.device3_3.geometry}
          material={materials['device3 part1']}
        />
      </group>
    </group>
  )
})

const Machine02 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(MACHINE02_PATH) as Machine02GLTFResult

  return (
    <group ref={group} {...props} dispose={null} scale={1}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes.device42.geometry}
        material={materials.device42}
      />
    </group>
  )
})
