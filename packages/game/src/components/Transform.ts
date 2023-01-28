import type { ComponentState } from '../core/Component'

import * as THREE from 'three'
import { v4 as uuid } from 'uuid'

import { Component } from '../core/Component'

const vec3 = new THREE.Vector3()
const euler = new THREE.Euler()

export interface TransformState extends ComponentState {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
}

export type TransformConstructorState = {
  [K in keyof TransformState]: TransformState[K] extends THREE.Vector3
    ? TransformState[K] | ReturnType<THREE.Vector3['toArray']>
    : TransformState[K] extends THREE.Euler
    ? TransformState[K] | ReturnType<THREE.Euler['toArray']>
    : TransformState[K]
}

export class TransformComponent extends Component<TransformState> {
  public static create(data?: Partial<TransformConstructorState>) {
    return new TransformComponent(uuid(), {
      scale: vec3.clone().set(1, 1, 1),
      position: vec3.clone().set(0, 0, 0),
      rotation: euler.clone().set(0, 0, 0),
      isDisabled: false,
      ...data
    })
  }

  constructor(
    id: TransformComponent['id'],
    { scale, position, rotation, ...rest }: TransformConstructorState
  ) {
    super(
      { id, name: 'Transform' },
      {
        scale: Array.isArray(scale)
          ? vec3.clone().fromArray(scale)
          : (scale as THREE.Vector3),
        position: Array.isArray(position)
          ? vec3.clone().fromArray(position)
          : (position as THREE.Vector3),
        rotation: Array.isArray(rotation) ? euler.clone().fromArray(rotation) : rotation,
        ...rest
      }
    )
  }

  public setRotation(val: TransformConstructorState['rotation']) {
    this.store.setState({ rotation: this.toEuler(val) })
  }

  public setPosition(val: TransformConstructorState['position']) {
    this.store.setState({ position: this.toVector3(val) })
  }

  public setScale(val: TransformConstructorState['scale']) {
    this.store.setState({ scale: this.toVector3(val) })
  }

  public toJSON() {
    const { position, scale, rotation } = this.getState()

    return {
      ...super.toJSON(),
      state: {
        position: position.toArray(),
        scale: scale.toArray(),
        rotation: rotation.toArray()
      }
    }
  }

  private toEuler(val: number[] | THREE.Euler): THREE.Euler {
    return Array.isArray(val) ? euler.clone().fromArray(val) : val
  }

  private toVector3(val: ArrayLike<number> | THREE.Vector3): THREE.Vector3 {
    return (Array.isArray(val) ? vec3.clone().fromArray(val) : val) as THREE.Vector3
  }
}
