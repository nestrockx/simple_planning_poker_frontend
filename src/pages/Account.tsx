import React, { useEffect, useState } from 'react'
import api from '../api/api'
import ReturnHome from '../components/ReturnHome'
import AccountDropdown from '../components/AccountDropdown'
import { useNavigate } from 'react-router-dom'
import request from '../api/request'
import { CiEdit } from 'react-icons/ci'
import '@fontsource/montserrat/400.css'

const Account: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)
  const [editingNickname, setEditingNickname] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    localStorage.clear()
    sessionStorage.clear()
    await request.post('/auth/logout/')
    navigate('/login')
  }

  const fetchUserData = async () => {
    try {
      const response = await api.get('/userinfo/')
      setUsername(response.data.username)
      setNickname(response.data.profile.nickname)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
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

  return (
    <div>
      <ReturnHome />
      <AccountDropdown />
      <div className="montserrat pt-22 pb-8 text-center text-3xl text-white">
        My Account
      </div>
      <div className="mx-6 flex justify-center">
        <div className="mb-16 w-full max-w-md rounded-2xl bg-zinc-950/70 p-8 shadow-xl backdrop-blur-md">
          <h2 className="mb-6 text-2xl font-semibold text-white">Profile</h2>

          <div className="mb-5">
            <label className="block text-gray-400">Username:</label>
            <div className="text-xl text-gray-200">{username}</div>
          </div>

          <div className="mb-5">
            <label className="block text-gray-400">Display Name:</label>
            {!isEditing ? (
              <div className="flex items-center justify-between text-xl text-gray-200">
                <span>{nickname}</span>
                <CiEdit
                  onClick={handleEditClick}
                  className="size-7 cursor-pointer text-emerald-100"
                />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md bg-zinc-900 px-3 py-2 text-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={editingNickname || ''}
                  onChange={(e) => setEditingNickname(e.target.value)}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                    onClick={handleSaveNickname}
                    disabled={loading || editingNickname === nickname}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {successMsg && (
            <div className="mb-4 rounded bg-emerald-600 px-3 py-2 text-white">
              {successMsg}
            </div>
          )}

          <div className="mt-6 text-right">
            <button
              className="rounded bg-rose-800 px-4 py-2 text-white hover:bg-rose-900"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
