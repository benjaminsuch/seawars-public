import type { GLTF } from 'three-stdlib'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

type VulcanoIslandGLTFResult = GLTF & {
  nodes: {
    VolcanoIsland_LOD1: THREE.Mesh
  }
  materials: {
    ['standardSurface3.001']: THREE.MeshStandardMaterial
  }
}

const ISLAND01_PATH = '/assets/models/vulcano_island.glb'

useGLTF.preload(ISLAND01_PATH)

export const Island = forwardRef<any>((props, ref) => {
  return <VulcanoIsland ref={ref} />
})

const VulcanoIsland = forwardRef<any>((props, ref) => {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(ISLAND01_PATH) as VulcanoIslandGLTFResult

  return (
    <group ref={group} {...props} dispose={null} scale={1}>
      <mesh
        ref={ref}
        receiveShadow
        geometry={nodes.VolcanoIsland_LOD1.geometry}
        material={materials['standardSurface3.001']}
      />
    </group>
  )
})
