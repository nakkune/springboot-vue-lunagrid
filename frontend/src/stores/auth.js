import { defineStore } from 'pinia'
import http from '../api/http'

const AUTH_KEY = 'portal.auth'

function loadPersisted() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || { token: null, user: null }
  } catch (e) {
    return { token: null, user: null }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => loadPersisted(),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    userName: (state) => state.user?.userNm || state.user?.userId || '',
    isAdmin: (state) => (state.user?.roles || []).includes('ROLE_ADMIN'),
  },
  actions: {
    persist() {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token: this.token, user: this.user }))
    },
    async login({ userId, password }) {
      const { data } = await http.post('/auth/login', { userId, password })
      this.token = data.accessToken
      this.user = data.user
      this.persist()
      return data
    },
    async signup(payload) {
      const { data } = await http.post('/auth/signup', payload)
      return data
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem(AUTH_KEY)
    },
  },
})
