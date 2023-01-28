import chalk from 'chalk'

import logger from '../common/logger'

export type ExtractName<T> = T extends EventDispatcherEvent<infer N1, infer D1>
  ? N1
  : never

export type ExtractData<T> = T extends EventDispatcherEvent<infer N1, infer D1>
  ? D1
  : never

export type DispatchedEventListener<T> = (
  event: DispatchedEvent<EventDispatcherEvent<ExtractName<T>, ExtractData<T>>>
) => void

export type UnsubcribeCallback = () => void

export type DispatchedEventData = Record<string, unknown> | undefined

export type DispatchedEvent<T> = {
  dispatcher: EventDispatcher
  name: ExtractName<T>
} & { [K in keyof ExtractData<T>]: ExtractData<T>[K] }

export type EventDispatcherEvent<
  Name extends string,
  Data extends DispatchedEventData
> = {
  name: Name
  data: Data
}

export class EventDispatcher {
  private readonly listeners: Record<string, Array<DispatchedEventListener<any>>> = {}

  public addEventListener<T>(
    name: ExtractName<T>,
    listener: DispatchedEventListener<T>
  ): UnsubcribeCallback {
    if (!this.listeners[name]) {
      this.listeners[name] = []
    }
    if (this.listeners[name].indexOf(listener) === -1) {
      this.listeners[name].push(listener)
    }

    return () => this.removeEventListener(name, listener)
  }

  public hasEventListener<T>(
    name: ExtractName<T>,
    listener: DispatchedEventListener<T>
  ): boolean {
    return this.listeners[name]?.indexOf(listener) !== -1
  }

  public removeEventListener<T>(
    name: ExtractName<T>,
    listener: DispatchedEventListener<T>
  ): void {
    const idx = this.listeners[name]?.indexOf(listener)

    if (idx > -1) {
      this.listeners[name].splice(idx, 1)
    }
  }

  public dispatchEvent<T>(name: ExtractName<T>, data: ExtractData<T>): void {
    logger.debug(`${chalk.cyanBright('[Event]:')} ${name}`)
    // Make a copy, in case listeners are removed while iterating.
    const listeners = this.listeners[name]?.slice()
    const event = { dispatcher: this, name }

    if (data) {
      for (const [key, val] of Object.entries(data)) {
        event[key] = val
      }
    }

    if (listeners !== undefined) {
      for (const listener of listeners) {
        listener.call(this, event)
      }
    }
  }

  public flush() {
    for (const [name, listeners] of Object.entries(this.listeners)) {
      for (const listener of listeners) {
        this.removeEventListener(name, listener)
      }
    }
  }
}
