import * as THREE from 'three'
import { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

import { GLTFResult, makeShip, Ship, ShipProps } from './Ship'

type BattlecruiserGLTFResult = GLTFResult<
  {
    model_batteship06: THREE.Mesh
    emissivelight: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
>

export type BattlecruiserProps = ShipProps<{}>

const PATH = '/assets/models/battleship06.glb'

export const Battlecruiser = makeShip<BattlecruiserProps>(
  PATH,
  forwardRef(function Battlecruiser(props, ref) {
    return (
      <Ship ref={ref} scale={0.9} position={[0, 1, 5]} {...props}>
        {({ gltf: { nodes, materials }, ...rest }: any) => (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.model_batteship06.geometry}
            material={materials.mat_battlefleet}
            {...rest}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.emissivelight.geometry}
              material={materials.mat_battleship_emissive}
            />
          </mesh>
        )}
      </Ship>
    )
  })
)

useGLTF.preload(PATH)
