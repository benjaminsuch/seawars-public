import type { VFC } from 'react'

import type { ComponentLoaderProps } from 'core/ComponentLoader'

import * as THREE from 'three'
import * as seawars from '@seawars/game'
import useRefs from 'react-use-refs'
import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Plane, useTexture } from '@react-three/drei'

import { createComponentStore } from 'core/createComponentStore'
import { useComponent } from 'core/useComponent'

const SCALAR = new THREE.Vector3(0.9, 0.9, 0.9)
const CIRCLE02_PATH = '/assets/textures/Circle02.png'
const TRIANGLE_DOWN_01_PATH = '/assets/textures/Triangle_Down_01.png'

const { FIELD_SIZE_X, FIELD_SIZE_Z } = seawars.BoardComponent

export const useTargetableStore =
  createComponentStore<seawars.TargetableComponent>('Targetable')

export const TargetableComponent: VFC<
  Omit<ComponentLoaderProps<seawars.TargetableComponent>, 'name'>
> = () => {
  const [circleRef, triangleRef] =
    useRefs<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>()
  const [isOver, setIsOver] = useState(false)
  const circleTexture = useTexture(CIRCLE02_PATH)
  const triangleTexture = useTexture(TRIANGLE_DOWN_01_PATH)
  const component = useComponent<seawars.TargetableComponent>('Targetable')!
  const { isDisabled, isTargetable } = useTargetableStore()

  const handlePointerUp = () => {
    component?.select()
  }

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer'
    circleRef.current?.material.color.set('#ff5252').convertSRGBToLinear()
    setIsOver(true)
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'default'
    circleRef.current?.material.color.set('#eb2121').convertSRGBToLinear()
    setIsOver(false)
  }

  useFrame(() => {
    if (isDisabled) {
      return
    }

    if (isOver) {
      circleRef.current?.scale.lerp(SCALAR, 0.25)
    } else {
      circleRef.current?.scale.lerp(SCALAR.clone().set(1, 1, 1), 0.25)
    }
  })

  if (isDisabled || !isTargetable) {
    return null
  }

  return (
    <group
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/*<Plane
        ref={triangleRef}
        args={[40, 40]}
        position={[0, 35, 35]}
        rotation-z={Math.PI}
        rotation-x={-(Math.PI / 1.25)}
        visible={isOver}
      >
        <meshBasicMaterial
          attach="material"
          map={triangleTexture}
          color="#eb2121"
          transparent
        />
  </Plane>*/}
      <Plane
        ref={circleRef}
        args={[FIELD_SIZE_X, FIELD_SIZE_Z]}
        position={[0, 0.5, 0]}
        rotation-x={-(Math.PI / 2)}
        visible={isTargetable}
      >
        <meshBasicMaterial
          attach="material"
          map={circleTexture}
          transparent
          alphaTest={0.001}
          color="#eb2121"
        />
      </Plane>
    </group>
  )
}

useTexture.preload(CIRCLE02_PATH)
