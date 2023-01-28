import * as THREE from 'three'
import { Water } from 'three-stdlib'
import { useRef, VFC } from 'react'
import { extend, useFrame, useLoader, Object3DNode } from '@react-three/fiber'

extend({ Water })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      water: Object3DNode<Water, typeof Water>
    }
  }
}

const WATER01_PATH = '/assets/textures/Water01_Normal.jpeg'
const WATER02_PATH = '/assets/textures/Water02_Normal.jpeg'
const WATER03_PATH = '/assets/textures/Water03_Normal.jpeg'
const WATER04_PATH = '/assets/textures/Water04_Normal.png'
const WATER05_PATH = '/assets/textures/Water05_Normal.jpeg'
const WATER06_PATH = '/assets/textures/Water06_Normal.jpg'
const WATER07_PATH = '/assets/textures/Water07_Normal.png'

export const PacificOcean: VFC = () => {
  const ref = useRef<Water>()
  const waterNormals = useLoader(THREE.TextureLoader, WATER07_PATH)

  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping

  useFrame((_, delta) => {
    if (ref.current) {
      const material = ref.current.material as THREE.ShaderMaterial & { uniforms: any }

      if (!Array.isArray(material)) {
        material.uniforms.time.value += delta * 0.75
      }
    }
  })

  const geometry = new THREE.PlaneGeometry(10000, 10000)
  const config = {
    textureWidth: 1024,
    textureHeight: 1024,
    waterNormals,
    sunDirection: new THREE.Vector3(0, 0, 0),
    sunColor: 0xdbd7c5,
    waterColor: 0x0f202b
  }

  return <water ref={ref} args={[geometry, config]} rotation-x={-Math.PI / 2} />
}

useLoader.preload(THREE.TextureLoader, WATER01_PATH)
useLoader.preload(THREE.TextureLoader, WATER02_PATH)
useLoader.preload(THREE.TextureLoader, WATER03_PATH)
useLoader.preload(THREE.TextureLoader, WATER04_PATH)
useLoader.preload(THREE.TextureLoader, WATER05_PATH)
useLoader.preload(THREE.TextureLoader, WATER06_PATH)
useLoader.preload(THREE.TextureLoader, WATER07_PATH)
