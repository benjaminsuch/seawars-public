import * as THREE from 'three'

import { isSSR } from './Game'

const globalAudioFiles: { [key: string]: null | GameAudio } = {
  alert01: null,
  beep01: null,
  cannonImpact01: null,
  cannonShot01: null,
  cannonShot02: null,
  click01: null,
  click02: null,
  click03: null,
  click04: null,
  click05: null,
  pickUp01: null,
  powerUp01: null
}

let listener: THREE.AudioListener
let loader: THREE.AudioLoader

if (!isSSR) {
  listener = new THREE.AudioListener()
  loader = new THREE.AudioLoader()

  loader.load('/assets/audio/Alert01.mp3', buffer => {
    globalAudioFiles.alert01 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/Beep01.mp3', buffer => {
    globalAudioFiles.beep01 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/CannonImpact01.mp3', buffer => {
    globalAudioFiles.cannonImpact01 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/CannonShot01.mp3', buffer => {
    globalAudioFiles.cannonShot01 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/CannonShot02.mp3', buffer => {
    globalAudioFiles.cannonShot02 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/Click01.mp3', buffer => {
    globalAudioFiles.click01 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/Click02.mp3', buffer => {
    globalAudioFiles.click02 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/Click03.mp3', buffer => {
    globalAudioFiles.click03 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/Click04.mp3', buffer => {
    globalAudioFiles.click04 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/Click05.mp3', buffer => {
    globalAudioFiles.click05 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/PickUp01.mp3', buffer => {
    globalAudioFiles.pickUp01 = new GameAudio(listener).setBuffer(buffer)
  })
  loader.load('/assets/audio/PowerUp01.mp3', buffer => {
    globalAudioFiles.powerUp01 = new GameAudio(listener).setBuffer(buffer)
  })
}

export const getGlobalAudioListener = (): THREE.AudioListener => listener

export const globalAudio = (key: keyof typeof globalAudioFiles) =>
  globalAudioFiles[key] as GameAudio

class GameAudio extends THREE.Audio {
  public play(delay?: number) {
    if (this.isPlaying) {
      this.stop()
    }

    super.play(delay)

    return this
  }
}
