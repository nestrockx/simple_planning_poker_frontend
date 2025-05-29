import React, { useEffect } from 'react'
import api from '../api/api'
import ReturnHome from '../components/ReturnHome'
import AccountDropdown from '../components/AccountDropdown'
import { useNavigate } from 'react-router-dom'
import request from '../api/request'

const Account: React.FC = () => {
  const [username, setUsername] = React.useState<string | null>(null)
  const [nickname, setNickname] = React.useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setUsername(localStorage.getItem('username'))
    setNickname(localStorage.getItem('nickname'))
    if (
      !localStorage.getItem('username') ||
      !localStorage.getItem('nickname')
    ) {
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
    api
      .get('/userinfo/')
      .then((response) => {
        setUsername(response.data.username)
        setNickname(response.data.profile.nickname)
      })
      .catch((error) => {
        console.error('Error fetching user data:', error)
      })
  }

  return (
    <div>
      <ReturnHome />
      <AccountDropdown />
      <h1 className="pt-16 pb-10 text-center text-3xl font-bold text-white">
        My Account
      </h1>
      <div className="mx-6 flex justify-center">
        <div className="w-96 rounded-lg bg-zinc-950/70 p-6 shadow-lg backdrop-blur-md">
          <h2 className="mb-4 text-2xl font-semibold text-white">Profile</h2>
          <div className="text-xl text-gray-200">Username:</div>
          <div className="mb-4 text-xl text-gray-200">{username}</div>
          <div className="text-xl text-gray-200">Displayname:</div>
          <div className="mb-4 text-xl text-gray-200">{nickname}</div>
          <button
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account
