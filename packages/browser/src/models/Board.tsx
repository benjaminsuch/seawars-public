import type { ReactNode, RefObject } from 'react'

import { ModelRendererProps, useGameObject } from 'core/GameObject'

import * as THREE from 'three'
import * as seawars from '@seawars/game'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { createContext, forwardRef, useContext, useRef, useState } from 'react'

import { useBoardStore } from 'components/Board'
import { GameObject } from 'core/GameObject'
import { useIsomorphicLayoutEffect } from 'core/useIsomorphicLayoutEffect'
import { getMatch } from 'scenes/Battlefield'
import { useUserContext } from 'ui/UserProvider'

const { FIELD_SIZE_X, FIELD_SIZE_Z } = seawars.BoardComponent
const FIELD02_PATH = '/assets/textures/Field02.png'
const obj3d = new THREE.Object3D()

const updateBoardMatrix = (
  ref: RefObject<THREE.InstancedMesh>,
  gameObject: seawars.GameObject
) => {
  const transform = gameObject.getComponent<seawars.TransformComponent>('Transform')
  const field = gameObject.getComponent<seawars.FieldComponent>('Field')

  if (field && transform) {
    const { index } = field.getState()
    const { position, rotation, scale } = transform.getState()

    obj3d.position.fromArray(position.toArray())
    obj3d.rotation.fromArray(rotation.toArray())
    obj3d.scale.fromArray(scale.toArray())
    obj3d.updateMatrix()

    if (ref.current) {
      ref.current.setMatrixAt(index, obj3d.matrix)
      ref.current.instanceMatrix.needsUpdate = true
    }
  }
}

export interface BoardContextValue {
  ref: RefObject<THREE.InstancedMesh>
}

export const BoardContext = createContext<BoardContextValue | null>(null)
BoardContext.displayName = 'Board'

export interface BoardProps extends Required<ModelRendererProps> {}

export const Board = forwardRef<ReactNode, BoardProps>(({ gameObject }, _) => {
  const { groupRef } = useGameObject()
  const { columns, rows } = useBoardStore()
  const user = useUserContext()
  const texture = useTexture(FIELD02_PATH)
  const ref = useRef<THREE.InstancedMesh>(null)
  const [playerPos, setPlayerPos] = useState(0)

  useIsomorphicLayoutEffect(() => {
    const match = getMatch()

    if (match && user.id) {
      const player = match.getPlayerById(user.id)
      setPlayerPos(player?.store.getState().position ?? 0)
    }
  }, [])

  let previousChildrenLength = 0

  useFrame(() => {
    if (groupRef.current && groupRef.current.rotation.y !== Math.PI) {
      if (playerPos === 1) {
        groupRef.current.rotation.y = Math.PI
      }
    }

    if (previousChildrenLength !== gameObject.children.length) {
      for (const child of gameObject.children) {
        updateBoardMatrix(ref, child)
      }

      previousChildrenLength = gameObject.children.length
    }
  })

  const children = gameObject.children.filter(
    child => child.children.length > 0 || child.components.has('Model')
  )

  return (
    <BoardContext.Provider value={{ ref }}>
      <instancedMesh ref={ref} args={[, , columns * rows]}>
        <planeGeometry args={[FIELD_SIZE_X, FIELD_SIZE_Z]} attach="geometry" />
        <meshBasicMaterial
          attach="material"
          map={texture}
          color="#fff"
          transparent
          opacity={0.075}
          alphaTest={0}
          depthWrite={false}
        />
      </instancedMesh>
      {children.map(child => (
        <GameObject key={child.id} id={child.id} />
      ))}
    </BoardContext.Provider>
  )
})

export const useBoardContext = () => {
  const context = useContext(BoardContext)

  if (!context) {
    throw `Board context is undefined. Please make sure to call useBoardContext as a child of <Board>.`
  }

  return context
}

useTexture.preload(FIELD02_PATH)
