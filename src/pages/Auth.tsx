import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInfo } from 'react-icons/fi'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (activeTab === 'login') {
        const loginRedirect = sessionStorage.getItem('afterLoginRedirect')

        if (loginRedirect != null) {
          navigate(loginRedirect)
        } else {
          navigate('/start/')
        }
      } else {
        const loginRedirect = sessionStorage.getItem('afterLoginRedirect')

        if (loginRedirect != null) {
          navigate(loginRedirect)
        } else {
          navigate('/start/')
        }
      }
    } catch (err) {
      console.error(err)
      if (activeTab === 'login') {
        setError('Invalid username or password.')
      } else {
        setError('User name already exists.')
      }
    }
  }

  const handleGuestLogin = async () => {
    navigate('/guest/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AccountDropdown />
      <ReturnHome />

      <div className="w-full max-w-sm rounded-xl bg-zinc-950/70 p-6 shadow-lg backdrop-blur-md">
        {/* Tab buttons with animated indicator */}
        <div className="relative mb-6 flex overflow-hidden rounded bg-zinc-800">
          <div
            className={`absolute top-0 left-0 h-full w-1/2 rounded bg-blue-600 transition-transform duration-300 ${
              activeTab === 'register' ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{ zIndex: 0 }}
          />

          <button
            className={`z-10 w-1/2 py-2 font-medium transition-colors duration-300 ${
              activeTab === 'login' ? 'text-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`z-10 w-1/2 py-2 font-medium transition-colors duration-300 ${
              activeTab === 'register' ? 'text-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth}>
          <h2 className="mb-4 text-2xl font-bold text-white capitalize">
            {activeTab}
          </h2>

          {error && <div className="mb-2 text-red-500">{error}</div>}

          <div className="mb-4">
            <label className="mb-1 flex items-center gap-1 text-white">
              Username
              <div className="group relative">
                <FiInfo className="cursor-pointer text-blue-400" />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded bg-zinc-800 p-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  Your <b>unique</b> name for login. Must be at least 3
                  characters.
                </div>
              </div>
            </label>
            <input
              className="w-full rounded border bg-zinc-700 px-3 py-2 text-white"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {activeTab === 'register' && (
            <div className="mb-4">
              <label className="mb-1 flex items-center gap-1 text-white">
                Displayname
                <div className="group relative">
                  <FiInfo className="cursor-pointer text-blue-400" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded bg-zinc-800 p-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                    This is how you will apear to others. You can change it
                    later.
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
          )}

          <div className="mb-4">
            <label className="mb-1 block text-white">Password</label>
            <input
              className="w-full rounded border bg-zinc-700 px-3 py-2 text-white"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            {activeTab === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGuestLogin}
          className="mt-4 block w-full text-center text-sm text-blue-400 hover:underline"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  )
}

export default Auth
