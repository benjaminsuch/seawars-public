import type { GLTF } from 'three-stdlib'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type Torpedo01GLTFResult = GLTF & {
  nodes: {
    ['MK-48']: THREE.Mesh
  }
  materials: {
    MK48: THREE.MeshStandardMaterial
  }
}

const TORPEDO01_PATH = '/assets/models/torpedo01.glb'

useGLTF.preload(TORPEDO01_PATH)

export interface TorpedoProps {
  variant?: 'torpedo01'
}

export const Torpedo = forwardRef<any, TorpedoProps>(({ variant = 'torpedo01' }, ref) => {
  return <Torpedo01 />
})

const Torpedo01 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(TORPEDO01_PATH) as Torpedo01GLTFResult

  return (
    <group ref={group} {...props} dispose={null} scale={0.75}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes['MK-48'].geometry}
        material={materials.MK48}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  )
})
