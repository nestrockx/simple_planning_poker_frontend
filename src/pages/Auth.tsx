import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInfo } from 'react-icons/fi'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'
import request from '../api/request'
import LoadingSpinnerEmerald from '../components/LoadingSpinnerEmerald'
import { CgClose } from 'react-icons/cg'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import '@fontsource/montserrat/600.css'

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [registered, setRegistered] = useState<boolean>(false)
  const [requesting, setRequesting] = useState<boolean>(false)

  const getPasswordValidationStatus = (password: string) => {
    return {
      length: password.length >= 7,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
  }
  const isPasswordValid = (password: string) => {
    const checks = getPasswordValidationStatus(password)
    if (!checks.length) return false
    if (!checks.uppercase) return false
    if (!checks.lowercase) return false
    if (!checks.number) return false
    if (!checks.special) return false
    return true
  }

  const passwordValidation = getPasswordValidationStatus(password)

  useEffect(() => {
    setError('')
    setUsername('')
    setPassword('')
    setNickname('')
  }, [activeTab])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequesting(true)
    setError('')

    if (username.length < 4) {
      setError('Username must be at least 4 characters long.')
      return
    }
    if (activeTab === 'register' && !isPasswordValid(password)) {
      setError('Inavlid password')
      return
    }
    if (activeTab === 'login' && password.length < 7) {
      setError('Password must be at least 7 characters long.')
      return
    }

    try {
      if (activeTab === 'login') {
        await request.post('/auth/login/', {
          username,
          password,
        })
      } else {
        await request.post('/auth/register/', {
          username,
          nickname,
          password,
        })
      }

      const loginRedirect = sessionStorage.getItem('afterLoginRedirect')
      localStorage.clear()
      sessionStorage.clear()

      if (activeTab === 'register') {
        setRequesting(false)
        setRegistered(true)
        setTimeout(() => {
          if (loginRedirect != null) {
            navigate(loginRedirect)
          } else {
            navigate('/start/')
          }
        }, 2000)
      } else {
        setRequesting(false)
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

      <div className="mx-4 mt-25 mb-15 w-full max-w-sm rounded-xl bg-zinc-950/70 p-6 shadow-lg backdrop-blur-md">
        {/* Tab buttons with animated indicator */}
        <div className="relative mb-6 flex overflow-hidden rounded bg-zinc-800">
          <div
            className={`absolute top-0 left-0 h-full w-1/2 rounded bg-emerald-700 transition-transform duration-300 ${
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
          <h2 className="montserrat mb-4 text-2xl font-bold text-white capitalize">
            {activeTab}
          </h2>

          {error && (
            <div className="mb-2 text-rose-500 shadow-2xl">{error}</div>
          )}

          <div className="mb-4">
            <label className="mb-1 flex items-center gap-1 text-white">
              Username
              <div className="group relative">
                <FiInfo className="cursor-pointer text-emerald-400" />
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
                  <FiInfo className="cursor-pointer text-emerald-400" />
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

          {activeTab === 'register' && !registered && !requesting && (
            <ul className="mt-2 mb-4 space-y-1 text-sm text-white">
              <li
                className={`flex gap-2 ${
                  passwordValidation.length ? 'text-green-400' : 'text-zinc-400'
                }`}
              >
                {passwordValidation.length ? (
                  <IoIosCheckmarkCircle size={20} />
                ) : (
                  <CgClose className="text-rose-500" size={20} />
                )}
                At least 7 characters
              </li>
              <li
                className={`flex gap-2 ${
                  passwordValidation.uppercase
                    ? 'text-green-400'
                    : 'text-zinc-400'
                }`}
              >
                {passwordValidation.uppercase ? (
                  <IoIosCheckmarkCircle size={20} />
                ) : (
                  <CgClose className="text-rose-500" size={20} />
                )}
                At least one uppercase letter
              </li>
              <li
                className={`flex gap-2 ${
                  passwordValidation.lowercase
                    ? 'text-green-400'
                    : 'text-zinc-400'
                }`}
              >
                {passwordValidation.lowercase ? (
                  <IoIosCheckmarkCircle size={20} />
                ) : (
                  <CgClose className="text-rose-500" size={20} />
                )}
                At least one lowercase letter
              </li>
              <li
                className={`flex gap-2 ${
                  passwordValidation.number ? 'text-green-400' : 'text-zinc-400'
                }`}
              >
                {passwordValidation.number ? (
                  <IoIosCheckmarkCircle size={20} />
                ) : (
                  <CgClose className="text-rose-500" size={20} />
                )}
                At least one number
              </li>
              <li
                className={`flex gap-2 ${
                  passwordValidation.special
                    ? 'text-green-400'
                    : 'text-zinc-400'
                }`}
              >
                {passwordValidation.special ? (
                  <IoIosCheckmarkCircle size={20} />
                ) : (
                  <CgClose className="text-rose-500" size={20} />
                )}
                At least one special character
              </li>
            </ul>
          )}

          {!registered && !requesting && (
            <button
              type="submit"
              className="w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700"
            >
              {activeTab === 'login' ? 'Login' : 'Register'}
            </button>
          )}

          {registered && (
            <div className="mt-5 rounded-xl bg-emerald-600 p-3 text-white">
              Succesfully registered, redirecting...
            </div>
          )}
        </form>
        {activeTab === 'login' && !requesting && (
          <button
            type="button"
            onClick={handleGuestLogin}
            className="mt-4 block w-full text-center text-emerald-400 hover:underline"
          >
            Continue as Guest
          </button>
        )}
        {requesting && <LoadingSpinnerEmerald />}
      </div>
    </div>
  )
}

export default Auth
