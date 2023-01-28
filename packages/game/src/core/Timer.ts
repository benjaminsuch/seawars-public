export type TimerEventType = 'tick' | 'complete' | 'pause' | 'start' | 'resume' | 'reset'

export type TimerEventHandler<T = unknown> = (val: T) => void

export type TimerEvents = {
  [K in TimerEventType]: TimerEventHandler[]
}

export interface TimerEvent<Type extends TimerEventType = any, Data = any> {
  type: Type
  handler: TimerEventHandler<Data>
}

export type TimerTickEvent = TimerEvent<'tick', IteratorResult<number, number>>

export type TimerCompleteEvent = TimerEvent<'complete'>

export type TimerPauseEvent = TimerEvent<'pause'>

export type TimerStartEvent = TimerEvent<'start'>

export type TimerResumeEvent = TimerEvent<'resume'>

export type TimerResetEvent = TimerEvent<'reset'>

export type TimerGenerator = Generator<number, number, number>

export interface TimerOptions {
  /**
   * Timer duration in ms.
   */
  duration: number
  /**
   * Timer interval in ms.
   */
  interval: number
  /**
   * Counts down instead of up, when `true`.
   */
  countdown?: boolean
}

export type TimerConstructorOptions = Omit<TimerOptions, 'interval'> &
  Partial<Pick<TimerOptions, 'interval'>>

export class Timer {
  private readonly _events: TimerEvents = {
    complete: [],
    tick: [],
    start: [],
    pause: [],
    reset: [],
    resume: []
  }

  get events() {
    return this._events
  }

  private _options: TimerOptions

  get options() {
    return this._options
  }

  set options(val: TimerConstructorOptions) {
    this._options = { interval: 1000, ...val }
    this.reset()
  }

  private timer: TimerGenerator

  private _currentTime = 0

  get time() {
    return this._currentTime
  }

  private interval?: number | NodeJS.Timer

  private _isPaused = false

  get isPaused() {
    return this._isPaused
  }

  constructor(options: TimerConstructorOptions) {
    this._options = { interval: 1000, ...options }
    this._currentTime = options.duration
    this.timer = this.makeTimer(options.duration)
  }

  tick() {
    this.emitEvent<IteratorResult<number, number>>('tick', this.timer.next())
    return this
  }

  start() {
    const { countdown, duration, interval } = this._options

    this.emitEvent('start')
    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.tick()
      }
      if (countdown ? this._currentTime === 0 : this._currentTime >= duration) {
        clearInterval(this.interval as any)
        this.emitEvent('complete')
      }
    }, interval)

    return this
  }

  pause() {
    this._isPaused = true
    this.emitEvent('pause')

    return this
  }

  resume() {
    this._isPaused = false
    this.emitEvent('resume')

    return this
  }

  reset() {
    clearInterval(this.interval as any)

    this._currentTime = 0
    this.timer = this.makeTimer(this._options.duration)
    this.interval = undefined
    this.emitEvent('reset')

    return this
  }

  on<T extends TimerEvent>(event: T['type'], handler: T['handler']) {
    this._events[event].push(handler)
    return () => this.off(event, handler)
  }

  off<T extends TimerEvent>(event: T['type'], handler: T['handler']) {
    const idx = this._events[event].findIndex((item: T['handler']) => item === handler)
    this._events[event].splice(idx, 1)
  }

  toSeconds() {
    return Math.floor(Number((this.time / this._options.interval).toFixed(0)))
  }

  toJSON() {
    return {
      time: this.time,
      inSeconds: this.toSeconds(),
      isPaused: this.isPaused
    }
  }

  private emitEvent<T = unknown>(event: TimerEventType, val?: T) {
    this._events[event].map(handler => handler(val))
  }

  private *makeTimer(duration: TimerOptions['duration']) {
    const { countdown, interval } = this._options
    let time = 0

    while (time < duration) {
      time += interval
      this._currentTime = countdown ? duration - time : time
      yield this._currentTime
    }

    return time
  }
}
