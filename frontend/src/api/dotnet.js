import axios from 'axios'

const dotnetApi = axios.create({
  baseURL: import.meta.env.VITE_DOTNET_API_URL,
})

dotnetApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default dotnetApi
