export type Counter = ReturnType<typeof makeCounter> | undefined

export const makeCounter = (end = Infinity) => {
  let i = 0

  function counter() {
    if (i < end) {
      i += 1
      counter.count = i
    }

    if (i === end) {
      counter.isDone = true
    }

    return i
  }
  counter.count = i
  counter.isDone = end === 0

  return counter
}

export const makeCallbackHandler = (counter: Counter, done?: jest.DoneCallback) => () => {
  const result = counter?.()

  if (counter?.isDone) {
    return done?.()
  }

  return result
}
