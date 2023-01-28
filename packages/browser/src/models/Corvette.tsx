import { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

import { GLTFResult, makeShip, Ship, ShipProps } from './Ship'

type CorvetteGLTFResult = GLTFResult<
  {
    model_polyfleet_battleship07: THREE.Mesh
    emissivelight: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
>

export type CorvetteProps = ShipProps<{}>

const PATH = '/assets/models/battleship07.glb'

export const Corvette = makeShip<CorvetteProps>(
  PATH,
  forwardRef(function Corvette(props, ref) {
    return (
      <Ship ref={ref} position={[0, 0, 5]} {...props}>
        {({ gltf: { nodes, materials }, ...rest }: any) => (
          <>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.model_polyfleet_battleship07.geometry}
              material={materials.mat_battlefleet}
              {...rest}
              position-x={19.5}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.emissivelight.geometry}
                material={materials.mat_battleship_emissive}
              />
            </mesh>
            <group position={[0.05, 4, 11.75]}></group>
          </>
        )}
      </Ship>
    )
  })
)

useGLTF.preload(PATH)
