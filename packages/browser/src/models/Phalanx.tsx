import type { ModelRendererProps } from 'core/GameObject'
import type { GLTFResult, FleetMaterials } from 'types/fiber'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import useRefs from 'react-use-refs'

import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'

export type PhalanxBaseGLTFResult<T> = GLTFResult<
  T & {
    weapon_rotate: THREE.Mesh
    weapon_barrel_tilt: THREE.Mesh
    weapon_barrels: THREE.Mesh
    weapon_barrels1: THREE.Mesh
    weapon_barrels2: THREE.Mesh
  },
  FleetMaterials
>

export type Phalanx01GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx01: THREE.Mesh
}>

export type Phalanx02GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx02: THREE.Mesh
}>

export type Phalanx03GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx03: THREE.Mesh
}>

export type Phalanx04GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx04: THREE.Mesh
}>

export type Phalanx05GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx05: THREE.Mesh
}>

export type Phalanx06GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx06: THREE.Mesh
}>

export type Phalanx07GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx07: THREE.Mesh
}>

export type Phalanx08GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx08: THREE.Mesh
}>

export type Phalanx09GLTFResult = PhalanxBaseGLTFResult<{
  model_polyfleet_battleship_phalanx09: THREE.Mesh
}>

interface ModelConfig {
  path: string
  getProps: (nodes: any, materials?: any) => any
}

const createMeshProps = (nodes: any, root: any) => ({
  root,
  rotate: {
    geometry: nodes.weapon_rotate.geometry,
    material: nodes.weapon_rotate.material
  },
  tilt: {
    geometry: nodes.weapon_barrel_tilt.geometry,
    material: nodes.weapon_barrel_tilt.material
  },
  barrels: nodes.weapon_barrels && {
    geometry: nodes.weapon_barrels?.geometry,
    material: nodes.weapon_barrels?.material
  },
  barrels1: nodes.weapon_barrels1 && {
    geometry: nodes.weapon_barrels1?.geometry,
    material: nodes.weapon_barrels1?.material
  },
  barrels2: nodes.weapon_barrels2 && {
    geometry: nodes.weapon_barrels2?.geometry,
    material: nodes.weapon_barrels2?.material
  },
  barrels3: nodes.weapon_barrels3 && {
    geometry: nodes.weapon_barrels3?.geometry,
    material: nodes.weapon_barrels3?.material
  }
})

const models: Record<string, ModelConfig> = {
  phalanx01: {
    path: '/assets/models/phalanx01.glb',
    getProps: (nodes: Phalanx01GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx01.geometry,
        material: nodes.model_polyfleet_battleship_phalanx01.material
      })
  },
  phalanx02: {
    path: '/assets/models/phalanx02.glb',
    getProps: (nodes: Phalanx02GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx02.geometry,
        material: nodes.model_polyfleet_battleship_phalanx02.material
      })
  },
  phalanx03: {
    path: '/assets/models/phalanx03.glb',
    getProps: (nodes: Phalanx03GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx03.geometry,
        material: nodes.model_polyfleet_battleship_phalanx03.material
      })
  },
  phalanx04: {
    path: '/assets/models/phalanx04.glb',
    getProps: (nodes: Phalanx04GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx04.geometry,
        material: nodes.model_polyfleet_battleship_phalanx04.material
      })
  },
  phalanx05: {
    path: '/assets/models/phalanx05.glb',
    getProps: (nodes: Phalanx05GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx05.geometry,
        material: nodes.model_polyfleet_battleship_phalanx05.material
      })
  },
  phalanx06: {
    path: '/assets/models/phalanx06.glb',
    getProps: (nodes: Phalanx06GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx06.geometry,
        material: nodes.model_polyfleet_battleship_phalanx06.material
      })
  },
  phalanx07: {
    path: '/assets/models/phalanx07.glb',
    getProps: (nodes: Phalanx07GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx07.geometry,
        material: nodes.model_polyfleet_battleship_phalanx07.material
      })
  },
  phalanx08: {
    path: '/assets/models/phalanx08.glb',
    getProps: (nodes: Phalanx08GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx08.geometry,
        material: nodes.model_polyfleet_battleship_phalanx08.material
      })
  },
  phalanx09: {
    path: '/assets/models/phalanx09.glb',
    getProps: (nodes: Phalanx09GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_polyfleet_battleship_phalanx09.geometry,
        material: nodes.model_polyfleet_battleship_phalanx09.material
      })
  }
}

export interface PhalanxProps extends ModelRendererProps {}

export const Phalanx = forwardRef<any, PhalanxProps>((_, __) => {
  const {
    variant = 'phalanx01',
    angle = 0.15,
    tilt = 0
  } = { variant: 'phalanx01', angle: 0.15, tilt: 0 }
  const { path, getProps } = models[variant]
  const groupRef = useRef<THREE.Group>()
  const [rootRef, rotateRef, tiltRef] = useRefs<THREE.Mesh>()
  const [barrelsRef, barrels1Ref, barrels2Ref, barrels3Ref] = useRefs<THREE.Mesh>()
  const gltf = useGLTF(path) as any

  useIsomorphicLayoutEffect(() => {
    const { root, rotate, tilt, barrels, barrels1, barrels2, barrels3 } = getProps(
      gltf.nodes,
      gltf.materials
    )

    if (rootRef.current) {
      rootRef.current.geometry = root.geometry
      rootRef.current.material = root.material
    }
    if (rotateRef.current) {
      rotateRef.current.geometry = rotate.geometry
      rotateRef.current.material = rotate.material
    }
    if (tiltRef.current) {
      tiltRef.current.geometry = tilt.geometry
      tiltRef.current.material = tilt.material
    }
    if (barrelsRef.current && barrels) {
      barrelsRef.current.geometry = barrels.geometry
      barrelsRef.current.material = barrels.material
    }
    if (barrels1Ref.current && barrels1) {
      barrels1Ref.current.geometry = barrels1.geometry
      barrels1Ref.current.material = barrels1.material
    }
    if (barrels2Ref.current && barrels2) {
      barrels2Ref.current.geometry = barrels2.geometry
      barrels2Ref.current.material = barrels2.material
    }
    if (barrels3Ref.current && barrels3) {
      barrels3Ref.current.geometry = barrels3.geometry
      barrels3Ref.current.material = barrels3.material
    }
  }, [gltf, name])

  return (
    <group ref={groupRef} dispose={null}>
      <mesh ref={rootRef} castShadow receiveShadow>
        <mesh ref={rotateRef} castShadow receiveShadow>
          <mesh ref={tiltRef} castShadow receiveShadow>
            <mesh ref={barrelsRef} castShadow receiveShadow />
            <mesh ref={barrels1Ref} castShadow receiveShadow />
            <mesh ref={barrels2Ref} castShadow receiveShadow />
            <mesh ref={barrels3Ref} castShadow receiveShadow />
          </mesh>
        </mesh>
      </mesh>
    </group>
  )
})

Object.values(models).forEach(({ path }) => {
  useGLTF.preload(path)
})
