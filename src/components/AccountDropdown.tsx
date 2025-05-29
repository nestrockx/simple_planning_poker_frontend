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
    setUsername(localStorage.getItem('username'))
    if (!localStorage.getItem('username')) {
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
      <button className="absolute top-4.5 right-26 text-2xl font-bold text-white transition hover:text-zinc-500">
        <FaUser size={28} />
      </button>

      {
        <div className="absolute top-11.5 right-4 z-10 hidden w-40 flex-col space-y-3 rounded-lg bg-[rgba(20,20,20,0.8)] p-4 text-white shadow-md backdrop-blur-md group-hover:flex">
          {localStorage.getItem('username') ? (
            <>
              <div className="border-b pb-2 font-semibold">
                Welcome {username}
              </div>
              <button
                onClick={handleAccountClick}
                className="text-left hover:text-blue-600"
              >
                Account
              </button>
              <button
                onClick={handleLogout}
                className="text-left hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="text-left hover:text-blue-600"
            >
              Login
            </button>
          )}
        </div>
      }
    </div>
  )
}

export default AccountDropdown
