import type { VFC } from 'react'

import type { GLTFResult, FleetMaterials } from 'types/fiber'

import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'

export type Missile01GLTFResult = GLTFResult<
  {
    model_weapon_missle01: THREE.Mesh
  },
  FleetMaterials
>

export type Missile02GLTFResult = GLTFResult<
  {
    model_weapon_missle02: THREE.Mesh
  },
  FleetMaterials
>

interface ModelConfig {
  path: string
  getProps: (nodes: any, materials?: any) => any
}

const models: Record<string, ModelConfig> = {
  missile01: {
    path: '/assets/models/missile01.glb',
    getProps: (
      nodes: Missile01GLTFResult['nodes'],
      materials: Missile01GLTFResult['materials']
    ) => ({
      root: {
        geometry: nodes.model_weapon_missle01.geometry,
        material: materials.mat_battlefleet
      }
    })
  },
  missile02: {
    path: '/assets/models/missile02.glb',
    getProps: (
      nodes: Missile02GLTFResult['nodes'],
      materials: Missile02GLTFResult['materials']
    ) => ({
      root: {
        geometry: nodes.model_weapon_missle02.geometry,
        material: materials.mat_battlefleet
      }
    })
  }
}

export interface MissileProps {
  model?: keyof typeof models
  scale?: number
}

export const Missile: VFC<MissileProps> = ({ model: name = 'missile01', ...props }) => {
  const { path, getProps } = models[name]
  const groupRef = useRef<THREE.Group>()
  const rootRef = useRef<THREE.Mesh>()
  const gltf = useGLTF(path) as any

  useIsomorphicLayoutEffect(() => {
    const nodes = getProps(gltf.nodes, gltf.materials)

    if (rootRef.current) {
      rootRef.current.geometry = nodes.root.geometry
      rootRef.current.material = nodes.root.material
    }
  }, [gltf, name])

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh ref={rootRef} castShadow receiveShadow />
    </group>
  )
}

Object.values(models).forEach(({ path }) => {
  useGLTF.preload(path)
})
