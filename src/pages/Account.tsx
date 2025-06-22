import ReturnHome from '../components/ReturnHome'
import AccountDropdown from '../components/AccountDropdown'
import { CiEdit } from 'react-icons/ci'
import '@fontsource/montserrat/400.css'
import { useAccount } from '../hooks/useAccount'

const Account: React.FC = () => {
  const {
    username,
    nickname,
    editingNickname,
    successMsg,
    loading,
    isEditing,
    setEditingNickname,
    handleLogout,
    handleSaveNickname,
    handleCancelEdit,
    handleEditClick,
  } = useAccount()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <ReturnHome />
      <AccountDropdown />

      <div className="montserrat pt-22 pb-8 text-center text-3xl text-white">
        My Account
      </div>
      <div className="mb-16 w-full max-w-md rounded-2xl bg-zinc-950/70 p-8 shadow-xl backdrop-blur-md">
        <h2 className="mb-6 text-2xl font-semibold text-white">Profile</h2>

        <div className="mb-5">
          <label className="block text-gray-400">Username:</label>
          <div className="text-xl text-gray-200">{username}</div>
        </div>

        <div className="mb-5">
          <label className="block text-gray-400">Display Name:</label>
          {!isEditing ? (
            <div className="flex items-center justify-between text-xl text-gray-200">
              <span>{nickname}</span>
              <CiEdit
                onClick={handleEditClick}
                className="size-7 cursor-pointer text-emerald-100"
              />
            </div>
          ) : (
            <div>
              <input
                type="text"
                className="mt-1 w-full rounded-md bg-zinc-700 px-3 py-2 text-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={editingNickname || ''}
                onChange={(e) => setEditingNickname(e.target.value)}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                  onClick={handleSaveNickname}
                  disabled={loading || editingNickname === nickname}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="mb-4 rounded bg-emerald-600 px-3 py-2 text-white">
            {successMsg}
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            className="rounded bg-rose-900 px-4 py-2 text-white transition duration-200 hover:bg-rose-950"
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
