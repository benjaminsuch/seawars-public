import * as THREE from 'three'
import { ReactNode, createContext, useContext, useRef, useEffect } from 'react'
import { MapControls as BaseMapControls } from '@react-three/drei'
import { MapControls as MapControlsImpl } from 'three-stdlib'

export type MapControlsContext =
  | undefined
  | {
      isEnabled: boolean
      enableCamera: () => void
      disableCamera: () => void
    }

export const MapControlsContext = createContext<MapControlsContext>(undefined)
MapControlsContext.displayName = 'MapControlsContext'

export interface MapControlsProps {
  children: ReactNode
}

export const MapControls = () => {
  const ref = useRef<MapControlsImpl>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.object.position.copy(ref.current.object.position.clone().setZ(900))
      ref.current.target = new THREE.Vector3(0, 0, 600)
      ref.current.update()
    }
  }, [])

  return (
    <BaseMapControls
      ref={ref}
      enableRotate={false}
      minDistance={200}
      maxDistance={1000}
      minPolarAngle={0.29717383381822427}
      maxPolarAngle={0.29717383381822427}
      dampingFactor={0.075}
    />
  )
}

export const useMapControls = () => {
  const context = useContext(MapControlsContext)

  if (!context) {
    throw `MapControls context is undefined. Please make sure to call useMapControls as a child of <MapControls>.`
  }

  return context
}
