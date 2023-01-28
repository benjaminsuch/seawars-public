import type { ReactNode, ForwardRefExoticComponent, VFC } from 'react'
import type { GroupProps, ObjectMap } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'

import * as THREE from 'three'
import * as seawars from '@seawars/game'
import { Float, Plane, PositionalAudio, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { forwardRef, useRef } from 'react'

import { useSelectableStore } from 'components/Selectable'
import { globalAudio } from 'core/audio'
import { GameObject, ModelRendererProps, useGameObject } from 'core/GameObject'
import { useComponent } from 'core/useComponent'
import { useSceneEvent } from 'core/useSceneEvent'

export interface GLTFResult<
  Nodes = ObjectMap['nodes'],
  Materials = ObjectMap['materials']
> extends GLTF {
  nodes: Nodes
  materials: Materials
}

export interface ShipChildrenProps<T> {
  gltf: T
  onAfterRender?: THREE.Object3D['onAfterRender']
  onBeforeRender?: THREE.Object3D['onBeforeRender']
}

export type ShipProps<P = {}> = GroupProps &
  ModelRendererProps & {
    children: <T extends GLTFResult>(props: ShipChildrenProps<T>) => ReactNode
    model: string
  } & P

const SPEED = 2
const SCOPE = 0.4

export const Ship = forwardRef<any, ShipProps>(
  ({ children, model, ...props }, customRef) => {
    const { gameObject } = useGameObject()
    const gltf = useGLTF(model) as GLTFResult
    const fallbackRef = useRef<THREE.Group>()
    const cannonShotAudioRef = useRef<THREE.PositionalAudio>()
    const cannonImpactAudioRef = useRef<THREE.PositionalAudio>()
    const selectable = useComponent<seawars.SelectableComponent>('Selectable')

    useSceneEvent<seawars.GunAttackAttackEvent>(
      'gunAttack.attack',
      ({ component, target }) => {
        if (component.gameObject.id === gameObject.id) {
          cannonShotAudioRef.current?.play()
        }
        if (gameObject.id === target) {
          cannonImpactAudioRef.current?.play(0.75)
        }
      }
    )

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

    const ref = customRef && typeof customRef !== 'function' ? customRef : fallbackRef

    return (
      <group
        scale={1}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <Float speed={10} rotationIntensity={0.025} floatIntensity={2.5}>
          <group ref={ref} {...props} dispose={null}>
            {children<GLTFResult>({ gltf })}
            {gameObject.children
              .filter(child => child.children.length > 0 || child.components.has('Model'))
              .map(child => (
                <GameObject key={child.id} id={child.id} />
              ))}
          </group>
        </Float>
        <SelectionMarker />
        <PositionalAudio
          ref={cannonShotAudioRef}
          url="/assets/audio/CannonShot01.mp3"
          distance={20}
          loop={false}
        />
        <PositionalAudio
          ref={cannonImpactAudioRef}
          url="/assets/audio/CannonImpact02.mp3"
          distance={20}
          loop={false}
        />
      </group>
    )
  }
)

export const makeShip = <P extends object>(
  path: string,
  Component: ForwardRefExoticComponent<P>
) => {
  const Wrapper = forwardRef((props: Omit<P, 'children' | 'model'>, ref) => {
    return <Component ref={ref} {...(props as P)} model={path} />
  })
  Wrapper.displayName = `makeShip(${Component.displayName || Component.name})`

  return Wrapper
}

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
    <Plane
      ref={ringRef}
      args={[FIELD_SIZE_X, FIELD_SIZE_Z]}
      position={[0, 0, 0]}
      rotation-x={-(Math.PI / 2)}
    >
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
