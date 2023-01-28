import type { VFC } from 'react'

import * as THREE from 'three'
import * as seawars from '@seawars/game'
import { forwardRef, useRef } from 'react'
import { Plane, useTexture } from '@react-three/drei'

import { useSelectableStore } from 'components/Selectable'
import { useComponent } from 'core/useComponent'

const FIELD_OPACITY = 0.2
const FIELD_HOVER_OPACITY = 0.75
const FIELD02_PATH = '/assets/textures/Field02.png'
const { FIELD_SIZE_X, FIELD_SIZE_Z } = seawars.BoardComponent

export const Field: VFC = forwardRef<any, {}>((props, ref) => {
  const groupRef = useRef<THREE.Group>(null)
  const planeRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null)
  const texture = useTexture(FIELD02_PATH)
  const selectable = useComponent<seawars.SelectableComponent>('Selectable')
  const { isDisabled } = useSelectableStore()

  const handlePointerUp = () => {
    selectable.select()
  }

  const handlePointerOver = () => {
    if (!isDisabled) {
      document.body.style.cursor = 'pointer'

      if (planeRef.current) {
        planeRef.current.material.opacity = FIELD_HOVER_OPACITY
      }
    }
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'default'

    if (planeRef.current) {
      planeRef.current.material.opacity = FIELD_OPACITY
    }
  }

  return (
    <group
      ref={groupRef}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      visible={!isDisabled}
    >
      <Plane ref={planeRef} args={[FIELD_SIZE_X, FIELD_SIZE_Z]}>
        <meshBasicMaterial
          attach="material"
          map={texture}
          color="#fff"
          transparent
          opacity={FIELD_OPACITY}
          depthWrite={false}
        />
      </Plane>
    </group>
  )
})
