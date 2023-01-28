import type { GLTF } from 'three-stdlib'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type Railgun05GLTFResult = GLTF & {
  nodes: {
    model_polyfleet_battleship_railgun5: THREE.Mesh
    model_weapon_rotate: THREE.Mesh
    model_railgun_barrel_back: THREE.Mesh
    model_railgun_barrel_front: THREE.Mesh
    emissive_1: THREE.Mesh
    emissive: THREE.Mesh
  }
  materials: {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
}

type Railgun08GLTFResult = GLTF & {
  nodes: {
    model_polyfleet_battleship_railgun8: THREE.Mesh
    model_weapon_rotate: THREE.Mesh
    model_railgun_barrel_right: THREE.Mesh
    model_railgun_barrel_front: THREE.Mesh
    emissive_3: THREE.Mesh
    emissive: THREE.Mesh
    model_railgun_barrel_left: THREE.Mesh
    model_railgun_barrel_front_1: THREE.Mesh
    emissive_2: THREE.Mesh
    emissive_1: THREE.Mesh
  }
  materials: {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
}

const RAILGUN05_PATH = '/assets/models/railgun05.glb'
const RAILGUN08_PATH = '/assets/models/railgun08.glb'

useGLTF.preload(RAILGUN05_PATH)
useGLTF.preload(RAILGUN08_PATH)

export interface RailgunProps {
  variant: 'railgun05' | 'railgun08'
}

export const Railgun = forwardRef<any, RailgunProps>(({ variant = 'railgun08' }, ref) => {
  if (variant === 'railgun08') {
    return <Railgun08 />
  }
  return <Railgun05 />
})

const Railgun05 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(RAILGUN05_PATH) as Railgun05GLTFResult

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes.model_polyfleet_battleship_railgun5.geometry}
        material={materials.mat_battlefleet}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_weapon_rotate.geometry}
          material={materials.mat_battlefleet}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.model_railgun_barrel_back.geometry}
            material={materials.mat_battlefleet}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.model_railgun_barrel_front.geometry}
              material={materials.mat_battlefleet}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.emissive_1.geometry}
                material={materials.mat_battleship_emissive}
              />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.emissive.geometry}
              material={materials.mat_battleship_emissive}
            />
          </mesh>
        </mesh>
      </mesh>
    </group>
  )
})

const Railgun08 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(RAILGUN08_PATH) as Railgun08GLTFResult

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes.model_polyfleet_battleship_railgun8.geometry}
        material={materials.mat_battlefleet}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_weapon_rotate.geometry}
          material={materials.mat_battlefleet}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.model_railgun_barrel_right.geometry}
            material={materials.mat_battlefleet}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.model_railgun_barrel_front.geometry}
              material={materials.mat_battlefleet}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.emissive_3.geometry}
                material={materials.mat_battleship_emissive}
              />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.emissive.geometry}
              material={materials.mat_battleship_emissive}
            />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.model_railgun_barrel_left.geometry}
            material={materials.mat_battlefleet}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.model_railgun_barrel_front_1.geometry}
              material={materials.mat_battlefleet}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.emissive_2.geometry}
                material={materials.mat_battleship_emissive}
              />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.emissive_1.geometry}
              material={materials.mat_battleship_emissive}
            />
          </mesh>
        </mesh>
      </mesh>
    </group>
  )
})
