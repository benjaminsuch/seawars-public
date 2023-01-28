import localforage from 'localforage'

const matches = localforage.createInstance({
  name: 'seawars',
  storeName: 'matches'
})

const user = localforage.createInstance({
  name: 'seawars',
  storeName: 'user'
})

export const storage = { matches, user }
