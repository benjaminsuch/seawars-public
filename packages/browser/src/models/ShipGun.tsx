import type { ModelRendererProps } from 'core/GameObject'
import type { GLTFResult, FleetMaterials } from 'types/fiber'

import { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import useRefs from 'react-use-refs'

import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'

export type ShipGunBaseGLTFResult<T> = GLTFResult<
  T & {
    model_cannon_small_barrels: THREE.Mesh
    model_cannon_small_barrels1: THREE.Mesh
    polySurface1: THREE.Mesh
    polySurface2: THREE.Mesh
  },
  FleetMaterials
>

export type ShipGun01GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon01: THREE.Mesh
}>

export type ShipGun02GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon02: THREE.Mesh
}>

export type ShipGun03GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon03: THREE.Mesh
}>

export type ShipGun04GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon04: THREE.Mesh
}>

export type ShipGun05GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon05: THREE.Mesh
}>

export type ShipGun06GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon06: THREE.Mesh
}>

export type ShipGun07GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon07: THREE.Mesh
}>

export type ShipGun08GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon08: THREE.Mesh
}>

export type ShipGun09GLTFResult = ShipGunBaseGLTFResult<{
  model_cannon09: THREE.Mesh
  model_cannon09_model_cannon08_pCylinder1_1: THREE.Mesh
  model_cannon09_model_cannon08_pCylinder1_2: THREE.Mesh
  model_cannon08_pCylinder2_1: THREE.Mesh
  model_cannon08_pCylinder2_2: THREE.Mesh
}>

interface ModelConfig {
  path: string
  getProps: (nodes: any, materials?: any) => any
  // Normalized position relative to "cannon01". Unfortunately cannons differ from their
  // initial position, so we use "cannon01" as the basis.
  position?: [number, number, number]
}

const createMeshProps = (nodes: any, root: any) => ({
  root,
  barrels: {
    geometry: nodes.model_cannon_small_barrels.geometry,
    material: nodes.model_cannon_small_barrels.material
  },
  barrels1: nodes.model_cannon_small_barrels1 && {
    geometry: nodes.model_cannon_small_barrels1.geometry,
    material: nodes.model_cannon_small_barrels1.material
  },
  cylinder1: nodes.model_cannon09_model_cannon08_pCylinder1_1 && {
    geometry: nodes.model_cannon09_model_cannon08_pCylinder1_1.geometry,
    material: nodes.model_cannon09_model_cannon08_pCylinder1_1.material
  },
  cylinder2: nodes.model_cannon09_model_cannon08_pCylinder1_2 && {
    geometry: nodes.model_cannon09_model_cannon08_pCylinder1_2.geometry,
    material: nodes.model_cannon09_model_cannon08_pCylinder1_2.material
  },
  cylinder3: nodes.model_cannon08_pCylinder2_1 && {
    geometry: nodes.model_cannon08_pCylinder2_1.geometry,
    material: nodes.model_cannon08_pCylinder2_1.material
  },
  cylinder4: nodes.model_cannon08_pCylinder2_2 && {
    geometry: nodes.model_cannon08_pCylinder2_2.geometry,
    material: nodes.model_cannon08_pCylinder2_2.material
  },
  surface1: nodes.polySurface1 && {
    geometry: nodes.polySurface1.geometry,
    material: nodes.polySurface1.material
  },
  surface2: nodes.polySurface2 && {
    geometry: nodes.polySurface2.geometry
  }
})

const models: Record<string, ModelConfig> = {
  cannon01: {
    path: '/assets/models/cannon01.glb',
    getProps: (nodes: ShipGun01GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon01.geometry,
        material: nodes.model_cannon01.material
      })
  },
  cannon02: {
    path: '/assets/models/cannon02.glb',
    getProps: (nodes: ShipGun02GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon02.geometry,
        material: nodes.model_cannon02.material
      }),
    position: [-0.33, -0.5, 0.35]
  },
  cannon03: {
    path: '/assets/models/cannon03.glb',
    getProps: (nodes: ShipGun03GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon03.geometry,
        material: nodes.model_cannon03.material
      })
  },
  cannon04: {
    path: '/assets/models/cannon04.glb',
    getProps: (nodes: ShipGun04GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon04.geometry,
        material: nodes.model_cannon04.material
      })
  },
  cannon05: {
    path: '/assets/models/cannon05.glb',
    getProps: (nodes: ShipGun05GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon05.geometry,
        material: nodes.model_cannon05.material
      })
  },
  cannon06: {
    path: '/assets/models/cannon06.glb',
    getProps: (nodes: ShipGun06GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon06.geometry,
        material: nodes.model_cannon06.material
      }),
    position: [-0.3, -0.65, 0.35]
  },
  cannon07: {
    path: '/assets/models/cannon07.glb',
    getProps: (nodes: ShipGun07GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon07.geometry,
        material: nodes.model_cannon07.material
      })
  },
  cannon08: {
    path: '/assets/models/cannon08.glb',
    getProps: (nodes: ShipGun08GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon08.geometry,
        material: nodes.model_cannon08.material
      })
  },
  cannon09: {
    path: '/assets/models/cannon09.glb',
    getProps: (nodes: ShipGun09GLTFResult['nodes']) =>
      createMeshProps(nodes, {
        geometry: nodes.model_cannon09.geometry,
        material: nodes.model_cannon09.material
      })
  }
}

export interface ShipGunProps extends ModelRendererProps {}

const MIN_TILT = 0.15
const MAX_TILT = 0.45
const MIN_ANGLE = -1.5
const MAX_ANGLE = 1.5

export const ShipGun = forwardRef<any, ShipGunProps>(() => {
  const {
    variant = 'cannon01',
    angle = 0.15,
    tilt = 0
  } = { variant: 'cannon01', angle: 0, tilt: 0 }
  const { path, getProps, ...rest } = models[variant]
  const gltf = useGLTF(path) as any
  const groupRef = useRef<THREE.Group>()
  const [rootRef, barrelsRef, barrels1Ref] = useRefs<THREE.Mesh>()
  const [surface1Ref, surface2Ref] = useRefs<THREE.Mesh>()
  const [cylinder1Ref, cylinder2Ref, cylinder3Ref, cylinder4Ref] = useRefs<THREE.Mesh>()

  const {
    root,
    barrels,
    barrels1,
    cylinder1,
    cylinder2,
    cylinder3,
    cylinder4,
    surface1,
    surface2
  } = getProps(gltf.nodes)

  useIsomorphicLayoutEffect(() => {
    if (rootRef.current) {
      rootRef.current.geometry = root.geometry
      rootRef.current.material = root.material
    }
    if (barrelsRef.current) {
      barrelsRef.current.geometry = barrels.geometry
      barrelsRef.current.material = barrels.material
    }
    if (barrels1Ref.current && barrels1) {
      barrels1Ref.current.geometry = barrels1.geometry
      barrels1Ref.current.material = barrels1.material
    }
    if (cylinder1Ref.current && cylinder1) {
      cylinder1Ref.current.geometry = cylinder1.geometry
      cylinder1Ref.current.material = cylinder1.material
    }
    if (cylinder2Ref.current && cylinder2) {
      cylinder2Ref.current.geometry = cylinder2.geometry
      cylinder2Ref.current.material = cylinder2.material
    }
    if (cylinder3Ref.current && cylinder3) {
      cylinder3Ref.current.geometry = cylinder3.geometry
      cylinder3Ref.current.material = cylinder3.material
    }
    if (cylinder4Ref.current && cylinder4) {
      cylinder4Ref.current.geometry = cylinder4.geometry
      cylinder4Ref.current.material = cylinder4.material
    }
    if (surface1Ref.current && surface1) {
      surface1Ref.current.geometry = surface1.geometry
      surface1Ref.current.material = surface1.material
    }
    if (surface2Ref.current && surface2) {
      surface2Ref.current.geometry = surface2.geometry
    }
  }, [
    root,
    barrels,
    barrels1,
    cylinder1,
    cylinder2,
    cylinder3,
    cylinder4,
    surface1,
    surface2
  ])

  const normalizedTilt = -Math.max(Math.min(Math.abs(tilt), MAX_TILT), MIN_TILT)
  const normalizedAngle = Math.max(Math.min(angle, MAX_ANGLE), MIN_ANGLE)

  return (
    <group ref={groupRef} dispose={null}>
      <mesh ref={rootRef} castShadow receiveShadow rotation-y={normalizedAngle} {...rest}>
        <group position={[0, normalizedTilt, 0.25]} rotation={[normalizedTilt, 0, 0]}>
          <mesh ref={barrelsRef} castShadow receiveShadow />
          {barrels1 && <mesh ref={barrels1Ref} castShadow receiveShadow />}
          {cylinder1 && <mesh ref={cylinder1Ref} castShadow receiveShadow />}
          {cylinder2 && <mesh ref={cylinder2Ref} castShadow receiveShadow />}
          {cylinder3 && <mesh ref={cylinder3Ref} castShadow receiveShadow />}
          {cylinder4 && <mesh ref={cylinder4Ref} castShadow receiveShadow />}
          {surface1 && <mesh ref={surface1Ref} castShadow receiveShadow />}
          {surface2 && (
            <mesh
              ref={surface2Ref}
              castShadow
              receiveShadow
              material={gltf.materials.mat_battleship_emissive}
            />
          )}
        </group>
      </mesh>
    </group>
  )
})

Object.values(models).forEach(({ path }) => {
  useGLTF.preload(path)
})
