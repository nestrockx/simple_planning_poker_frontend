import React from 'react'
import { FiInfo } from 'react-icons/fi'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'
import request from '../api/request'

const Guest: React.FC = () => {
  const [error, setError] = React.useState('')
  const [nickname, setNickname] = React.useState('')
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    request
      .post('/auth/guestlogin/', {
        nickname,
      })
      .then(() => {
        const loginRedirect = sessionStorage.getItem('afterLoginRedirect')

        if (loginRedirect != null) {
          window.location.href = loginRedirect
        } else {
          window.location.href = '/start/'
        }
      })
      .catch((error) => {
        console.error('Error during guest login:', error)
        setError('Guest login failed.')
      })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AccountDropdown />
      <ReturnHome />

      <div className="w-full max-w-sm rounded-xl bg-zinc-950/70 p-6 shadow-lg backdrop-blur-md">
        {/* Auth Form */}
        <form onSubmit={handleAuth}>
          <h2 className="mb-4 text-2xl font-bold text-white capitalize">
            Guest login
          </h2>
          {error && <div className="mb-2 text-red-500">{error}</div>}
          <div className="mb-4">
            <label className="mb-1 flex items-center gap-1 text-white">
              Displayname
              <div className="group relative">
                <FiInfo className="cursor-pointer text-blue-400" />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded bg-zinc-800 p-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  This is how you will apear to others.
                </div>
              </div>
            </label>
            <input
              className="w-full rounded border bg-zinc-700 px-3 py-2 text-white"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}

export default Guest
