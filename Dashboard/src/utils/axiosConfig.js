import axios from 'axios'


axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        
        const res = await axios.post(
          'http://localhost:3005/refresh-token',
          {},
          { withCredentials: true }
        )
        
        const newToken = res.data.token
        localStorage.setItem('token', newToken)
        
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axios(originalRequest)
        
      } catch (refreshError) {
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = 'http://localhost:3001'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default axios
