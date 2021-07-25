import { defineStore } from 'pinia'

export function createPiniaComposition (id) {
  const state = {},
        getters = {},
        createActions = new Map()

  const useState = (key: string, initialState) => {
    state[key] = initialState
  }

  const useGetter = (key: string, getter) => {
    getters[key] = getter
  }

  const useAction = (key: string, createAction) => {
    createActions.set(key, createAction)
  }

  const useStore = () => {
    const store = defineStore({
      id,
      state: () => state,
      getters: getters,
      actions: (() => {
        const tree = {}

        for (const [key] of createActions) {
          tree[key] = () => {}
        }

        return tree
      })(),
    })()

    const actions: Record<string, Function> = {}
    
    for (const [key, createAction] of createActions) {
      actions[key] = createAction(store)
    }

    store.$onAction(({ name, args }) => {
      actions[name](...args)
    })

    return store
  }

  return { useState, useGetter, useAction, useStore }
}
