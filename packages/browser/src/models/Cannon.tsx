import type { GLTF } from 'three-stdlib'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type Cannon01GLTFResult = GLTF & {
  nodes: {
    model_cannon01: THREE.Mesh
    model_cannon_small_barrels: THREE.Mesh
  }
  materials: {
    mat_battlefleet: THREE.MeshStandardMaterial
  }
}

type Cannon09GLTFResult = GLTF & {
  nodes: {
    model_cannon09: THREE.Mesh
    model_cannon_small_barrels1: THREE.Mesh
    model_cannon_small_barrels: THREE.Mesh
    model_cannon09_model_cannon08_pCylinder1_1: THREE.Mesh
    model_cannon09_model_cannon08_pCylinder1_2: THREE.Mesh
    model_cannon08_pCylinder2_1: THREE.Mesh
    model_cannon08_pCylinder2_2: THREE.Mesh
  }
  materials: {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
}

const CANNON01_PATH = '/assets/models/cannon01.glb'
const CANNON09_PATH = '/assets/models/cannon09.glb'

useGLTF.preload(CANNON01_PATH)
useGLTF.preload(CANNON09_PATH)

export interface CannonProps {
  variant?: 'cannon01' | 'cannon09'
}

export const Cannon = forwardRef<any, CannonProps>(({ variant = 'cannon01' }, ref) => {
  if (variant === 'cannon09') {
    return <Cannon09 />
  }
  return <Cannon01 />
})

const Cannon01 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(CANNON01_PATH) as Cannon01GLTFResult

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes.model_cannon01.geometry}
        material={materials.mat_battlefleet}
        position={[0.33, 0.72, -0.36]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_cannon_small_barrels.geometry}
          material={materials.mat_battlefleet}
        />
      </mesh>
    </group>
  )
})

const Cannon09 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(CANNON09_PATH) as Cannon09GLTFResult

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes.model_cannon09.geometry}
        material={materials.mat_battlefleet}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_cannon_small_barrels.geometry}
          material={materials.mat_battlefleet}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_cannon_small_barrels1.geometry}
          material={materials.mat_battlefleet}
        />
      </mesh>
    </group>
  )
})
