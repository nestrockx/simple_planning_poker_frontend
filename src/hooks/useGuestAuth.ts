import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import request from '../api/request'

export const useGuestAuth = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string>('')
  const [nickname, setNickname] = useState<string>('')
  const [requesting, setRequesting] = useState<boolean>(false)

  const handleGuestLogin = async (nickname: string) => {
    setError('')
    setRequesting(true)
    try {
      if (nickname.length > 30) throw new Error('Nickname is too long')

      await request.post('/auth/guestlogin/', { nickname })

      const loginRedirect = sessionStorage.getItem('afterLoginRedirect')

      localStorage.clear()
      // sessionStorage.clear()

      if (loginRedirect != null) {
        navigate(loginRedirect)
      } else {
        navigate('/start/')
      }
    } catch (err) {
      console.error('Error during guest login:', err)
      setError('Guest login failed.')
      setRequesting(false)
    }
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    handleGuestLogin(nickname)
  }

  return {
    error,
    requesting,
    nickname,
    setNickname,
    handleAuth,
  }
}
