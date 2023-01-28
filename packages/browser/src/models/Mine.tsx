import type { GLTF } from 'three-stdlib'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type Mine01GLTFResult = GLTF & {
  nodes: {
    pCylinder15: THREE.Mesh
  }
  materials: {
    lambert1: THREE.MeshStandardMaterial
  }
}

const MINE01_PATH = '/assets/models/mine01.glb'

useGLTF.preload(MINE01_PATH)

export interface MineProps {
  variant?: 'mine01'
}

export const Mine = forwardRef<any, MineProps>(({ variant = 'mine01' }, ref) => {
  return <Mine01 />
})

const Mine01 = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(MINE01_PATH) as Mine01GLTFResult

  return (
    <group ref={group} {...props} dispose={null} scale={75}>
      <group position={[0, 0.02, 0]} scale={1.54} />
      <group position={[0, 0.03, 0]} scale={[0.23, 0.03, 0.23]} />
      <group position={[0, 0.03, 0]} scale={[0.17, 0.02, 0.17]} />
      <group position={[0, 0.03, 0]} scale={[0.11, 0.13, 0.11]} />
      <group position={[0.01, 0, 0]} rotation={[0, 0, 0.7]} />
      <group position={[-0.01, 0, 0]} rotation={[0, 0, -0.7]} />
      <group rotation={[0, 1.57, 0]} />
      <group position={[0.01, 0.01, 0.01]} rotation={[-1.3, 0.21, 0.67]} />
      <group position={[-0.01, 0.01, -0.01]} rotation={[1.39, 0.22, -0.61]} />
      <group rotation={[Math.PI, 1.41, -Math.PI]} />
      <group position={[0, 0.03, 0]} rotation={[Math.PI, 0.72, 0]} />
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={nodes.pCylinder15.geometry}
        material={materials.lambert1}
      />
    </group>
  )
})
