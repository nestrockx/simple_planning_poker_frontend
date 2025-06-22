import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import request from '../api/request'

export const useAuth = () => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [registered, setRegistered] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const getPasswordValidationStatus = (password: string) => ({
    length: password.length >= 7 && password.length <= 128,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  })

  const isPasswordValid = (password: string) => {
    const checks = getPasswordValidationStatus(password)
    return (
      checks.length &&
      checks.uppercase &&
      checks.lowercase &&
      checks.number &&
      checks.special
    )
  }

  const passwordValidation = getPasswordValidationStatus(password)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (username.length < 4) {
      setError('Username must be at least 4 characters long.')
      return
    }
    if (activeTab === 'register' && !isPasswordValid(password)) {
      setError('Invalid password')
      return
    }
    if (activeTab === 'login' && password.length < 7) {
      setError('Password must be at least 7 characters long.')
      return
    }
    if (activeTab === 'login' && password.length > 128) {
      setError('Password cannot be longer than 128 characters.')
      return
    }

    setRequesting(true)

    try {
      if (activeTab === 'login') {
        await request.post('/auth/login/', { username, password })
      } else {
        await request.post('/auth/register/', { username, nickname, password })
      }

      const loginRedirect = sessionStorage.getItem('afterLoginRedirect')
      localStorage.clear()
      sessionStorage.clear()

      if (activeTab === 'register') {
        setRegistered(true)
        setTimeout(() => {
          navigate(loginRedirect ?? '/start/')
        }, 2000)
      } else {
        navigate(loginRedirect ?? '/start/')
      }
    } catch (err) {
      console.error('Error during authentication', err)
      setError(
        activeTab === 'login'
          ? 'Invalid username or password.'
          : 'User name already exists.',
      )
    } finally {
      setRequesting(false)
    }
  }

  const handleGuestLogin = () => {
    navigate('/guest/')
  }

  return {
    activeTab,
    setActiveTab,
    registered,
    requesting,
    username,
    setUsername,
    password,
    setPassword,
    nickname,
    setNickname,
    error,
    passwordValidation,
    handleAuth,
    handleGuestLogin,
  }
}
