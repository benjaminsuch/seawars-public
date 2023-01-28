export type Nullable<T> = { [K in keyof T]: T[K] | null }

export type Class<T = unknown> = { new (...args: any[]): T }

export type DecoratorFunction<Target = any, Prop = string | symbol> = (
  target: Target,
  prop: Prop,
  descriptor: PropertyDescriptor
) => void
