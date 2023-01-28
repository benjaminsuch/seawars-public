import type { MutableRefObject, VFC } from 'react'
import type { GroupProps } from '@react-three/fiber'

import * as THREE from 'three'
import * as seawars from '@seawars/game'
import useRefs from 'react-use-refs'
import { createContext, forwardRef, useContext, useEffect } from 'react'

import { models } from '../models'
import { ComponentLoader } from './ComponentLoader'
import { useActiveScene } from './useActiveScene'
import { useForceUpdate } from './useForceUpdate'
import { useSceneEvent } from './useSceneEvent'

export interface GameObjectContextValue {
  gameObject: seawars.GameObject
  modelRef: MutableRefObject<THREE.Group | undefined>
  groupRef: MutableRefObject<THREE.Group | undefined>
}

export const GameObjectContext = createContext<GameObjectContextValue | null>(null)
GameObjectContext.displayName = 'GameObject'

export interface ModelRendererProps {
  gameObject: seawars.GameObject
  model?: seawars.ModelComponent
}

const ModelRenderer: VFC<ModelRendererProps & GroupProps> = forwardRef(
  ({ gameObject, model, ...props }, ref) => {
    const key = model?.getState().name as keyof typeof models
    const ModelComponent = models[key]

    if (!model || !ModelComponent) {
      return null
    }

    return <ModelComponent ref={ref} {...props} gameObject={gameObject} model={model} />
  }
)

export interface GameObjectProps {
  id: seawars.GameObject['id']
}

export const GameObject: VFC<GameObjectProps> = ({ id }) => {
  const [groupRef, modelRef] = useRefs<THREE.Group>()
  const scene = useActiveScene()
  const update = useForceUpdate()
  const gameObject = scene.gameObjects.get(id)

  useSceneEvent<seawars.GameObjectChildAddedEvent>(
    'gameObject.child-added',
    event => {
      if (event.gameObject.id === id) {
        update()
      }
    },
    [id, scene, update]
  )

  useSceneEvent<seawars.GameObjectChildRemovedEvent>(
    'gameObject.child-removed',
    event => {
      if (event.gameObject.id === id) {
        update()
      }
    },
    [id, scene, update]
  )

  const transform = gameObject?.getComponent<seawars.TransformComponent>('Transform')
  const model = gameObject?.getComponent<seawars.ModelComponent>('Model')

  useEffect(
    () =>
      transform?.store.subscribe(state => {
        groupRef.current?.position.copy(state.position)
      }),
    [groupRef, transform]
  )

  if (!gameObject) {
    return null
  }
  if (gameObject.tags.has('item')) {
    console.log('item', gameObject.id)
  }
  const { position, scale, rotation } = transform!.getState()

  const context: GameObjectContextValue = {
    gameObject,
    modelRef,
    groupRef
  }

  return (
    <GameObjectContext.Provider value={context}>
      <group position={position} scale={scale} rotation={rotation} ref={groupRef}>
        {gameObject.getComponentList().map(component => (
          <ComponentLoader
            key={component.id}
            name={component.name}
            gameObject={gameObject}
            component={component}
          />
        ))}
        <ModelRenderer ref={modelRef} gameObject={gameObject} model={model} />
      </group>
    </GameObjectContext.Provider>
  )
}

export const useGameObject = () => {
  const context = useContext(GameObjectContext)

  if (!context) {
    throw `GameObject context is undefined. Please make sure to call useGameObject as a child of <GameObject>.`
  }

  return context
}
