import type { GLTF } from 'three-stdlib'
import type { ObjectMap } from '@react-three/fiber'

export interface GLTFResult<
  Nodes = ObjectMap['nodes'],
  Materials = ObjectMap['materials']
> extends GLTF {
  nodes: Nodes
  materials: Materials
}

export interface FleetMaterials {
  mat_battlefleet: THREE.MeshStandardMaterial
  mat_battleship_emissive: THREE.MeshStandardMaterial
}
