import { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

import { CarrierVehicle } from './CarrierVehicle'
import { MissileRack } from './MissileRack'
import { Jet } from './Jet'
import { GLTFResult, makeShip, Ship, ShipProps } from './Ship'

type AircraftCarrierGLTFResult = GLTFResult<
  {
    model_batteship05: THREE.Mesh
    emissivelight: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
    mat_battleship_emissive: THREE.MeshStandardMaterial
  }
>

export type AircraftCarrierProps = ShipProps<{}>

const PATH = '/assets/models/battleship05.glb'

export const AircraftCarrier = makeShip<AircraftCarrierProps>(
  PATH,
  forwardRef(function AircraftCarrier(props, ref) {
    return (
      <Ship ref={ref} scale={0.425} {...props}>
        {({ gltf: { nodes, materials }, ...rest }: any) => (
          <>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.model_batteship05.geometry}
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
            <group position-y={17.75}>
              <group position={[-18, 0, 0]} rotation-y={Math.PI}>
                <Jet />
              </group>
              <group scale={1.35} position={[10, 0, 12.5]}>
                <group rotation-y={2}>
                  <Jet />
                </group>
                <group position-z={-17.5} rotation-y={2}>
                  <Jet />
                </group>
                <group position-z={-35} rotation-y={2}>
                  <Jet />
                </group>
              </group>
            </group>
            <group position-y={14.575}>
              <CarrierVehicle />
              <group position={[7.5, 0, 5]} rotation-y={0.9}>
                <MissileRack
                  missiles={[
                    [true, true],
                    [true, true]
                  ]}
                />
              </group>
              <group position={[-20, 0, 12.5]} rotation-y={-(Math.PI / 2)}>
                <MissileRack
                  missiles={[
                    [true, true],
                    [true, true]
                  ]}
                />
              </group>
              <group position={[-20, 0, 15]} rotation-y={-(Math.PI / 2)}>
                <MissileRack
                  missiles={[
                    [true, true],
                    [true, true]
                  ]}
                />
              </group>
            </group>
          </>
        )}
      </Ship>
    )
  })
)

useGLTF.preload(PATH)
