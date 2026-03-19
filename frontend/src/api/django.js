import axios from 'axios'

const djangoApi = axios.create({
  baseURL: import.meta.env.VITE_DJANGO_API_URL,
})

djangoApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default djangoApi
