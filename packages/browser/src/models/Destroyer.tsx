import { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

import { GLTFResult, makeShip, Ship, ShipProps } from './Ship'

type DestroyerGLTFResult = GLTFResult<
  {
    model_batteship03: THREE.Mesh
    emissivelight: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
>

export type DestroyerProps = ShipProps

const PATH = '/assets/models/battleship03.glb'

export const Destroyer = makeShip<DestroyerProps>(
  PATH,
  forwardRef(function Destroyer(props, ref) {
    return (
      <Ship ref={ref} scale={0.95} position={[0, 0.5, 5]} {...props}>
        {({ gltf: { nodes, materials }, ...rest }: any) => (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.model_batteship03.geometry}
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
