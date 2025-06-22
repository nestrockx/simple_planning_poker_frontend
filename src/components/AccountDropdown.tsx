import { FaUser } from 'react-icons/fa'
import { useAccountDropdown } from '../hooks/useAccountDropdown'

const AccountDropdown: React.FC = () => {
  const { username, handleLogout, handleLogin, handleAccountClick } =
    useAccountDropdown()

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
            className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-700 hover:text-zinc-300"
          >
            Login
          </button>
        )}
      </div>
    </div>
  )
}

export default AccountDropdown
