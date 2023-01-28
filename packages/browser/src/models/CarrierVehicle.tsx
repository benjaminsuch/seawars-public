import type { VFC } from 'react'

import type { GLTFResult } from '../../types/fiber'

import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type CarrierVehicleGLTFResult = GLTFResult<
  {
    model_carrier_vehicle: THREE.Mesh
    model_wheel_back_left: THREE.Mesh
    model_wheel_front_left: THREE.Mesh
    model_wheel_front_right: THREE.Mesh
    model_wheel_back_right: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
  }
>

const PATH = '/assets/models/carrier_vehicle.glb'

export interface CarrierVehicleProps {}

export const CarrierVehicle: VFC<CarrierVehicleProps> = props => {
  const groupRef = useRef<THREE.Group>()
  const { nodes } = useGLTF(PATH) as CarrierVehicleGLTFResult

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.model_carrier_vehicle.geometry}
        material={nodes.model_carrier_vehicle.material}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_wheel_back_left.geometry}
          material={nodes.model_wheel_back_left.material}
          position={[0, 0, -0.02]}
          rotation={[-Math.PI, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_wheel_front_left.geometry}
          material={nodes.model_wheel_front_left.material}
          position={[0, 0, 0.03]}
          rotation={[-Math.PI, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_wheel_front_right.geometry}
          material={nodes.model_wheel_front_right.material}
          position={[0, 0, 0.01]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.model_wheel_back_right.geometry}
          material={nodes.model_wheel_back_right.material}
          position={[0, 0, 0.01]}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload(PATH)
