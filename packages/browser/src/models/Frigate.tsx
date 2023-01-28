import { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

import { GLTFResult, makeShip, Ship, ShipProps } from './Ship'

type FrigateGLTFResult = GLTFResult<
  {
    model_batteship02: THREE.Mesh
    emissivelight: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
>

export type FrigateProps = ShipProps<{}>

const PATH = '/assets/models/battleship02.glb'

export const Frigate = makeShip<FrigateProps>(
  PATH,
  forwardRef(function Frigate(props, ref) {
    return (
      <Ship ref={ref} {...props}>
        {({ gltf: { nodes, materials }, ...rest }: any) => (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.model_batteship02.geometry}
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
