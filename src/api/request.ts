import axios from 'axios'

const request = axios.create({
  baseURL: '/rest',
  withCredentials: true,
})

export default request
