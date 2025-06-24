import { FaUser } from 'react-icons/fa'
import { useAccountDropdown } from '../hooks/useAccountDropdown'

const AccountDropdown: React.FC = () => {
  const { username, handleLogout, handleLogin, handleAccountClick } =
    useAccountDropdown()

  return (
    <div className="group">
      {/* Icon Button */}
      <button className="absolute top-4.5 right-26.5 text-black transition-colors hover:text-zinc-400 dark:text-white">
        <FaUser size={26} />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute top-11 right-10 z-20 hidden w-46 flex-col rounded-xl px-4 py-4 text-black shadow-lg outline-1 backdrop-blur-md group-hover:flex dark:bg-zinc-800/50 dark:text-white dark:outline-0">
        {localStorage.getItem('username') ? (
          <>
            <div className="mb-2 border-b px-1 pb-2 font-bold text-black dark:border-zinc-600 dark:text-zinc-300">
              Hi {username}!
            </div>
            <button
              onClick={handleAccountClick}
              className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 dark:active:bg-zinc-500"
            >
              Account
            </button>
            <button
              onClick={handleLogout}
              className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 dark:active:bg-zinc-500"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 dark:active:bg-zinc-500"
          >
            Login
          </button>
        )}
      </div>
    </div>
  )
}

export default AccountDropdown
