// src/stores/useMainStore.js
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    message: '影院列表'
  }),
  actions: {
    updateMessage(newMessage) {
      this.message = newMessage
    }
  }
})
