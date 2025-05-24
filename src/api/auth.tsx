import axios from 'axios'

const auth = axios.create({
  baseURL: 'http://localhost:8000/auth',
})

export default auth
