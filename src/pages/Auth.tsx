import { FiInfo } from 'react-icons/fi'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'
import LoadingSpinnerEmerald from '../components/LoadingSpinnerEmerald'
import { CgClose } from 'react-icons/cg'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import '@fontsource/montserrat/600.css'
import { useAuth } from '../hooks/useAuth'
import DarkModeButton from '../components/DarkModeButton'

const Auth: React.FC = () => {
  const {
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
  } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AccountDropdown />
      <ReturnHome />
      <DarkModeButton />

      <div className="mx-4 mt-25 mb-15 w-full max-w-sm rounded-xl p-6 shadow-xl outline-1 backdrop-blur-md dark:bg-zinc-950/70 dark:outline-0">
        {/* Tab buttons with animated indicator */}
        <div className="relative mb-6 flex overflow-hidden rounded outline-1 dark:bg-zinc-800 dark:outline-0">
          <div
            className={`absolute top-0 left-0 h-full w-1/2 rounded bg-emerald-400 transition-transform duration-300 dark:bg-emerald-700 ${
              activeTab === 'register' ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{ zIndex: 0 }}
          />

          <button
            className={`z-10 w-1/2 py-2 font-medium transition-colors duration-300 ${
              activeTab === 'login'
                ? 'text-black dark:text-white'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`z-10 w-1/2 py-2 font-medium transition-colors duration-300 ${
              activeTab === 'register'
                ? 'text-black dark:text-white'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth}>
          <h2 className="montserrat mb-4 text-2xl font-bold text-black capitalize dark:text-white">
            {activeTab}
          </h2>

          {error && (
            <div className="mb-2 text-rose-500 shadow-2xl">{error}</div>
          )}

          <div className="mb-4">
            <label className="mb-1 flex items-center gap-1 text-black dark:text-white">
              Username
              <div className="group relative">
                <FiInfo className="cursor-pointer text-emerald-800 dark:text-emerald-400" />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded bg-zinc-800 p-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  Your <b>unique</b> name for login. Must be at least 3
                  characters.
                </div>
              </div>
            </label>
            <input
              className="w-full rounded border px-3 py-2 text-black dark:bg-zinc-700 dark:text-white"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {activeTab === 'register' && (
            <div className="mb-4">
              <label className="mb-1 flex items-center gap-1 text-black dark:text-white">
                Displayname
                <div className="group relative">
                  <FiInfo className="cursor-pointer text-emerald-800 dark:text-emerald-400" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded bg-zinc-800 p-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                    This is how you will apear to others. You can change it
                    later.
                  </div>
                </div>
              </label>
              <input
                className="w-full rounded border px-3 py-2 text-black dark:bg-zinc-700 dark:text-white"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-black dark:text-white">
              Password
            </label>
            <input
              className="w-full rounded border px-3 py-2 text-black dark:bg-zinc-700 dark:text-white"
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
                  passwordValidation.length
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-zinc-600 dark:text-zinc-400'
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
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-zinc-600 dark:text-zinc-400'
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
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-zinc-600 dark:text-zinc-400'
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
                  passwordValidation.number
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-zinc-600 dark:text-zinc-400'
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
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-zinc-600 dark:text-zinc-400'
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
              className="w-full rounded bg-emerald-400 py-2 text-black hover:bg-emerald-300 active:bg-emerald-100 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700"
            >
              {activeTab === 'login' ? 'Login' : 'Register'}
            </button>
          )}

          {registered && (
            <div className="mt-5 rounded-xl bg-emerald-400 p-3 text-black dark:bg-emerald-600 dark:text-white">
              Succesfully registered, redirecting...
            </div>
          )}
        </form>
        {activeTab === 'login' && !requesting && (
          <button
            type="button"
            onClick={handleGuestLogin}
            className="mt-4 block w-full text-center text-emerald-800 hover:underline dark:text-emerald-400"
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
