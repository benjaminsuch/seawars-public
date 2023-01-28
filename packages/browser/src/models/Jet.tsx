import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

import type { GLTFResult } from '../../types/fiber'

export type JetGLTFResult = GLTFResult<
  {
    model_fighter_jet: THREE.Mesh
    flap1: THREE.Mesh
    landing_gear_back_left: THREE.Mesh
    flap2: THREE.Mesh
    landing_gear_back_right: THREE.Mesh
    back1: THREE.Mesh
    back2: THREE.Mesh
    landing_gear_front: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
  }
>

const PATH = '/assets/models/fighter_jet.glb'

export const Jet = props => {
  const group = useRef()
  const { nodes } = useGLTF(PATH) as JetGLTFResult

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.model_fighter_jet.geometry}
        material={nodes.model_fighter_jet.material}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.flap1.geometry}
          material={nodes.flap1.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.flap2.geometry}
          material={nodes.flap2.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.back1.geometry}
          material={nodes.back1.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.back2.geometry}
          material={nodes.back2.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.landing_gear_back_right.geometry}
          material={nodes.landing_gear_back_right.material}
          position={[-0.93, 0, 7.91]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.landing_gear_front.geometry}
          material={nodes.landing_gear_front.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.landing_gear_back_left.geometry}
          material={nodes.landing_gear_back_left.material}
          position={[0.95, 0, 7.91]}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload(PATH)
