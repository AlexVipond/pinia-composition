import { computed, reactive } from 'vue'
import type { ComputedRef, WritableComputedRef } from 'vue'
import { defineStore } from 'pinia'

type Setup = (api: SetupApi) => object

type SetupApi = {
  state: <T>(initialValue: T) => WritableComputedRef<T>,
  getter: <T>(getter: () => T) => ComputedRef<T>,
  action: <T extends Function>(action: T) => T,
}

export function usePiniaSetup (id: string, setup: Setup) {
  function toDefineStoreOptions (bindings) {
    return {
      state: () => ({}),
      getters: {},
      actions: {}
    }
  }
  
  const setupApi: SetupApi = {
    state: initialValue => computed(() => initialValue),
    getter: getter => computed(getter),
    action: action => action,
  }

  return defineStore({
    id,
    ...toDefineStoreOptions(setup(setupApi))
  })
}
