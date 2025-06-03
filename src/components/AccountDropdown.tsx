import React, { useEffect } from 'react'
import { FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import request from '../api/request'

const AccountDropdown: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = React.useState<string | null>(null)
  // const [nickname, setNickname] = React.useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('username')) {
      setUsername(localStorage.getItem('username'))
    } else {
      fetchUserData()
    }
  }, [])

  const fetchUserData = async () => {
    api
      .get('/userinfo/')
      .then((response) => {
        setUsername(response.data.username)
        localStorage.setItem('username', response.data.username)
        localStorage.setItem('nickname', response.data.profile.nickname)
        // setNickname(response.data.profile.nickname);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error)
      })
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

  const handleAccountClick = async () => {
    navigate('/account')
  }

  return (
    <div className="group">
      {/* Icon Button */}
      <button className="absolute top-4.5 right-26.5 text-white transition-colors hover:text-zinc-400">
        <FaUser size={26} />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute top-11 right-10 z-20 hidden w-46 flex-col rounded-xl bg-zinc-800/50 px-4 py-4 text-white shadow-lg backdrop-blur-md group-hover:flex">
        {localStorage.getItem('username') ? (
          <>
            <div className="mb-2 border-b border-zinc-600 px-1 pb-2 font-bold text-zinc-300">
              Hi {username}!
            </div>
            <button
              onClick={handleAccountClick}
              className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-700 hover:text-zinc-300"
            >
              Account
            </button>
            <button
              onClick={handleLogout}
              className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-700 hover:text-zinc-300"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            Login
          </button>
        )}
      </div>
    </div>
  )
}

export default AccountDropdown
