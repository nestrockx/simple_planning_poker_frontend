import { FiInfo } from 'react-icons/fi'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'
import LoadingSpinnerEmerald from '../components/LoadingSpinnerEmerald'
import '@fontsource/montserrat/600.css'
import { useGuestAuth } from '../hooks/useGuestAuth'
import DarkModeButton from '../components/DarkModeButton'

const Guest: React.FC = () => {
  const { error, requesting, nickname, setNickname, handleAuth } =
    useGuestAuth()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AccountDropdown />
      <ReturnHome />
      <DarkModeButton />

      <div className="mx-4 mt-25 mb-15 w-full max-w-sm rounded-xl p-6 shadow-xl outline-1 backdrop-blur-md dark:bg-zinc-950/70 dark:outline-0">
        {/* Auth Form */}
        <form onSubmit={handleAuth}>
          <h2 className="montserrat mb-4 text-2xl font-bold text-black capitalize dark:text-white">
            Guest login
          </h2>
          {error && <div className="mb-2 text-red-500">{error}</div>}
          <div className="mb-4">
            <label className="mb-1 flex items-center gap-1 text-black dark:text-white">
              Displayname
              <div className="group relative">
                <FiInfo className="cursor-pointer text-emerald-700 dark:text-emerald-400" />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded bg-zinc-800 p-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  This is how you will apear to others.
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
          {!requesting ? (
            <button
              type="submit"
              className="w-full rounded bg-emerald-400 py-2 text-black hover:bg-emerald-300 active:bg-emerald-100 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700"
            >
              Continue
            </button>
          ) : (
            <LoadingSpinnerEmerald />
          )}
        </form>
      </div>
    </div>
  )
}

export default Guest
