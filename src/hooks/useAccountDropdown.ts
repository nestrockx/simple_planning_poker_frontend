import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import request from '../api/request'

export const useAccountDropdown = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    if (savedUsername) {
      setUsername(savedUsername)
    } else {
      fetchUserData()
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await api.get('/userinfo/')
      const fetchedUsername = response.data.username
      const fetchedNickname = response.data.profile.nickname

      setUsername(fetchedUsername)
      localStorage.setItem('username', fetchedUsername)
      localStorage.setItem('nickname', fetchedNickname)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleLogout = async () => {
    localStorage.clear()
    sessionStorage.clear()
    await request.post('/auth/logout/')
    navigate('/login')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleAccountClick = () => {
    navigate('/account')
  }

  return {
    username,
    handleLogout,
    handleLogin,
    handleAccountClick,
  }
}
