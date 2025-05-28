import axios from 'axios'

const request = axios.create({
  baseURL: 'https://simple-planning-poker-backend.onrender.com',
  withCredentials: true,
})

export default request
