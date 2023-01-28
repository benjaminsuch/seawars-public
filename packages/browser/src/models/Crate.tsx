import * as seawars from '@seawars/game'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { forwardRef, useRef, VFC } from 'react'
import { Float, Plane, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

import { useCrateStore } from 'components/Crate'
import { useSelectableStore } from 'components/Selectable'
import { globalAudio } from 'core/audio'
import { useGameObject } from 'core/GameObject'
import { Rotation } from 'core/Rotation'
import { useComponent, useComponentEvent } from 'core/useComponent'
import { Mine } from './Mine'
import { Railgun } from './Railgun'
import { Shell } from './Shell'
import { Torpedo } from './Torpedo'
import { Cannon } from './Cannon'
import { Machine } from './Machine'

type CrateGLTFResult = GLTF & {
  nodes: {
    Aset_industrial_storage_M_vh3lbfy_LOD2: THREE.Mesh
  }
  materials: {
    ['default_material.001']: THREE.MeshStandardMaterial
  }
}

const PATH = '/assets/models/crate01.glb'

export const Crate = forwardRef<any>((props, ref) => {
  const { nodes, materials } = useGLTF(PATH) as CrateGLTFResult
  const { gameObject } = useGameObject()
  const group = useRef<THREE.Group>()
  const crate = useComponent<seawars.CrateComponent>('Crate')
  const selectable = useComponent<seawars.SelectableComponent>('Selectable')
  const store = useCrateStore()

  const handlePointerUp = () => {
    console.log(gameObject.id, gameObject)
    if (!selectable.getState().isSelected) {
      globalAudio('click02').setVolume(0.25).play()
    }
    selectable?.select()
  }

  const handlePointerOver = () => {
    if (!selectable?.getState().isDisabled) {
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'default'
  }

  useComponentEvent<seawars.CrateAnimatePickUpEvent>(
    crate,
    'crate.animate-pickup',
    () => {
      //TODO: Play pick-up animation?
      //TODO: Play item sound?
      //TODO: Play pick-up sound
      globalAudio('pickUp01').play()
    }
  )

  if (store.isDisabled) {
    return null
  }

  return (
    <group
      ref={group}
      dispose={null}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...props}
    >
      <Float speed={3.5} rotationIntensity={1.5}>
        <group scale={3.5} position={[0, 0, 10]} rotation={[Math.PI / 2, 0, 0]}>
          <Rotation speed={0.025}>
            {store.item?.name === 'cannon09' && (
              <group scale={0.75} rotation={[Math.PI * -0.35, 0, 0]} position={[0, 0, 0]}>
                <Cannon variant="cannon09" />
              </group>
            )}
            {store.item?.name === 'railgun05' && (
              <group scale={1} rotation={[Math.PI * -0.35, 0, 0]} position={[0, 0, 0]}>
                <Railgun variant="railgun05" />
              </group>
            )}
            {store.item?.name === 'railgun08' && (
              <group scale={1} rotation={[Math.PI * -0.35, 0, 0]} position={[0, 0, 0]}>
                <Railgun variant="railgun08" />
              </group>
            )}
            {store.item?.name === 'machine02' && (
              <group scale={0.02}>
                <Machine variant="machine02" />
              </group>
            )}
            {store.item?.name === 'mine01' && <Mine />}
            {store.item?.name === 'shell01' && <Shell />}
            {store.item?.name === 'torpedo01' && <Torpedo />}
          </Rotation>
        </group>
        <mesh
          ref={ref}
          scale={20}
          position={[0, -7.5, 0]}
          castShadow
          receiveShadow
          geometry={nodes.Aset_industrial_storage_M_vh3lbfy_LOD2.geometry}
          material={materials['default_material.001']}
        />
      </Float>
      <SelectionMarker />
    </group>
  )
})

useGLTF.preload(PATH)

const SPEED = 2
const SCOPE = 0.4
const CIRCLE02_PATH = '/assets/textures/Circle02.png'
const { FIELD_SIZE_X, FIELD_SIZE_Z } = seawars.BoardComponent

const SelectionMarker: VFC = () => {
  const texture = useTexture(CIRCLE02_PATH)
  const ringRef = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null)
  const { isDisabled, isSelected } = useSelectableStore()

  useFrame(({ clock }) => {
    if (ringRef.current) {
      let val = 1

      if (isSelected) {
        val = Math.cos(Math.sin(clock.getElapsedTime() * SPEED) * SCOPE)
      }

      ringRef.current.scale.x = val
      ringRef.current.scale.y = val
      ringRef.current.scale.z = val
    }
  })

  return (
    <Plane ref={ringRef} args={[FIELD_SIZE_X / 2, FIELD_SIZE_Z / 2]} position={[0, 0, 0]}>
      <meshBasicMaterial
        attach="material"
        map={texture}
        color="#e3cb2b"
        transparent
        opacity={!isDisabled && isSelected ? 1 : 0}
        alphaTest={0.001}
        depthWrite={false}
      />
    </Plane>
  )
}

useTexture.preload(CIRCLE02_PATH)
