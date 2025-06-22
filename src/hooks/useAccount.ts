import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import request from '../api/request'

export const useAccount = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [editingNickname, setEditingNickname] = useState<string | null>(null)

  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    const savedNickname = localStorage.getItem('nickname')

    if (savedUsername && savedNickname) {
      setUsername(savedUsername)
      setNickname(savedNickname)
    } else {
      fetchUserData()
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await api.get('/userinfo/')
      setUsername(response.data.username)
      setNickname(response.data.profile.nickname)
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

  const handleSaveNickname = async () => {
    if (!editingNickname || editingNickname === nickname) {
      setIsEditing(false)
      return
    }
    setLoading(true)
    try {
      await api.post('/profile/', { nickname: editingNickname })
      setNickname(editingNickname)
      localStorage.setItem('nickname', editingNickname)
      setSuccessMsg('Display name updated successfully.')
      setTimeout(() => setSuccessMsg(null), 1500)
    } catch (error) {
      console.error('Failed to update nickname:', error)
    } finally {
      setLoading(false)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingNickname(nickname)
    setIsEditing(false)
  }

  const handleEditClick = () => {
    setEditingNickname(nickname)
    setIsEditing(true)
  }

  return {
    username,
    nickname,
    editingNickname,
    successMsg,
    loading,
    isEditing,
    setEditingNickname,
    handleLogout,
    handleSaveNickname,
    handleCancelEdit,
    handleEditClick,
  }
}
