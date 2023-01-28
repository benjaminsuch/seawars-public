import type { GLTF } from 'three-stdlib'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type Shell01GLTFResult = GLTF & {
  nodes: {
    projectile_body: THREE.Mesh
  }
  materials: {
    BaseMat: THREE.MeshStandardMaterial
  }
}

const SHELL01_PATH = '/assets/models/shell01.glb'

useGLTF.preload(SHELL01_PATH)

export interface ShellProps {
  variant?: 'shell01'
}

export const Shell = forwardRef<any, ShellProps>(({ variant = 'shell01' }, ref) => {
  return <Shell01 />
})

const Shell01 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(SHELL01_PATH) as Shell01GLTFResult

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={5}
      rotation={[0, Math.PI * 0.5, Math.PI * 0.25]}
      position={[-0.25, 0, -0.25]}
    >
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes.projectile_body.geometry}
        material={materials.BaseMat}
      />
    </group>
  )
})
