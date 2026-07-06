import axios from 'axios'

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://niveshcapital-backend.onrender.com';
const LANDING_URL = process.env.REACT_APP_LANDING_URL || 'https://niveshcapital.vercel.app';

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
          '/refresh-token',
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
        window.location.href = LANDING_URL
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default axios
