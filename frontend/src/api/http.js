import axios from 'axios'

const AUTH_KEY = 'portal.auth'

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || { token: null, user: null }
  } catch (e) {
    return { token: null, user: null }
  }
}

const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 요청 인터셉터: JWT 첨부
http.interceptors.request.use((config) => {
  const { token } = loadAuth()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터: 401 → 자동 로그아웃, 에러는 {status, message} 형태로 전달
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(AUTH_KEY)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    const payload = error.response ? error.response.data : null
    return Promise.reject(payload || error)
  }
)

export default http
