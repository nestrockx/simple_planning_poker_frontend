import axios from 'axios'

const api = axios.create({
  baseURL: 'https://simple-planning-poker-backend.onrender.com/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
