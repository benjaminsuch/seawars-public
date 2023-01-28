import type { VFC } from 'react'

import type { GLTFResult } from '../../types/fiber'

import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

import { Missile } from './Missile'

type MissileRackGLTFResult = GLTFResult<
  {
    model_missile_rack: THREE.Mesh
  },
  {
    mat_battlefleet: THREE.MeshStandardMaterial
  }
>

const PATH = '/assets/models/missile_rack.glb'

export interface MissileRackProps {
  missiles?: [[boolean, boolean], [boolean, boolean]]
  missileType?: string
}

export const MissileRack: VFC<MissileRackProps> = ({
  missiles = [
    [false, false],
    [false, false]
  ],
  ...props
}) => {
  const groupRef = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(PATH) as MissileRackGLTFResult
  const [front, back] = missiles

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.model_missile_rack.geometry}
        material={materials.mat_battlefleet}
      />
      <group position-y={0.75}>
        {(front[0] || front[1]) && (
          <group position-z={-1.2}>
            {front[0] && <Missile model="missile02" />}
            {front[1] && (
              <group position-x={-0.8}>
                <Missile model="missile02" />
              </group>
            )}
          </group>
        )}
        {(back[0] || back[1]) && (
          <group position-z={1.6}>
            {back[0] && <Missile model="missile02" />}
            {back[1] && (
              <group position-x={-0.8}>
                <Missile model="missile02" />
              </group>
            )}
          </group>
        )}
      </group>
    </group>
  )
}

useGLTF.preload(PATH)
