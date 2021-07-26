import { computed, reactive } from 'vue'
import type { ComputedRef, WritableComputedRef } from 'vue'
import { defineStore } from 'pinia'

type Setup = (api: SetupApi) => object

type SetupApi = {
  state: <T>(initialValue: T) => State<T>,
  getter: <T>(getter: () => T) => Getter<T>,
}

export function usePiniaSetup (id: string, setup: Setup) {
  function toDefineStoreOptions (bindings) {
    const state = {},
          getters = {},
          actions = {}

    for (const [key, value] of Object.entries(bindings)) {
      if (value instanceof State) {
        state[key] = value.value
      } else if (value instanceof Getter) {
        getters[key] = value.value
      } else {
        actions[key] = value
      }
    }

    return {
      state: () => state,
      getters,
      actions,
    }
  }

  const setupApi: SetupApi = {
    state: initialValue => new State(initialValue),
    getter: getter => new Getter(getter),
  }

  return defineStore({
    id,
    ...toDefineStoreOptions(setup(setupApi))
  })
}

class State<T> {
  private state: T
  constructor (initialValue: T) {
    this.state = initialValue
  }

  get value () {
    return this.state
  }

  set value (newValue) {
    this.state = newValue
  }
}

class Getter<T> {
  private getter: () => T
  constructor (getter: () => T) {
    this.getter = getter
  }

  get value () {
    return this.getter()
  }
}
