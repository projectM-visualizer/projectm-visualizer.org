import { defineStore, acceptHMRUpdate } from 'pinia'

export const useDataStore = defineStore('data', () => {})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}
