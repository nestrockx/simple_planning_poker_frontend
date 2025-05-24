import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers['Authorization'] = `Token ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API error:', error)
    if (error.response && error.response.status === 401) {
      if (
        window.location.pathname !== '/login/' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/guest/' &&
        window.location.pathname !== '/guest'
      ) {
        sessionStorage.setItem('afterLoginRedirect', window.location.pathname)
        window.location.href = '/login/' // Force redirect to login page
      }
    }
    return Promise.reject(error)
  },
)

export default api
