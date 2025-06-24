import { useEffect } from 'react'
import api from '../api/api'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'
import LoadingSpinnerEmerald from '../components/LoadingSpinnerEmerald'
import LoadingSpinnerCyan from '../components/LoadingSpinnerCyan'
import { useRoomJoinCreate } from '../hooks/useRoomJoinCreate'
import DarkModeButton from '../components/DarkModeButton'
import '@fontsource/montserrat/600.css'

const RoomJoinCreate: React.FC = () => {
  const {
    roomName,
    setRoomName,
    joinRoomCode,
    setJoinRoomCode,
    deckType,
    setDeckType,
    joinError,
    createError,
    joinRequesting,
    createRequesting,
    handleCreateRoom,
    handleJoinRoom,
  } = useRoomJoinCreate()

  useEffect(() => {
    api.get('/empty/')
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <AccountDropdown />
      <ReturnHome />
      <DarkModeButton />

      {/* Create Room */}
      <form
        onSubmit={handleCreateRoom}
        className="mt-5 w-full max-w-md space-y-4 rounded-xl p-6 shadow-xl outline-1 backdrop-blur-md sm:mt-0 dark:bg-zinc-950/70"
      >
        <div className="montserrat text-center text-2xl dark:text-white">
          Create a Planning Poker Room
        </div>

        {createError && (
          <div className="text-sm text-red-500">{createError}</div>
        )}

        <div>
          <label className="mb-2 block font-medium dark:text-white">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 dark:bg-zinc-700 dark:text-zinc-200"
            placeholder="e.g. Sprint Planning"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium dark:text-white">
            Deck Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 dark:text-white">
              <input
                className="accent-cyan-600 dark:accent-cyan-700"
                type="radio"
                name="deckType"
                value="default"
                checked={deckType === 'default'}
                onChange={() => setDeckType('default')}
              />
              Default 1, 2, 3, 4, 5, 6...
            </label>
            <label className="flex items-center gap-2 dark:text-white">
              <input
                className="accent-cyan-600 dark:accent-cyan-700"
                type="radio"
                name="deckType"
                value="fibonacci"
                checked={deckType === 'fibonacci'}
                onChange={() => setDeckType('fibonacci')}
              />
              Fibonacci 1, 2, 3, 5, 8...
            </label>
          </div>
          <div className="mt-3 flex gap-4">
            <label className="flex items-center gap-2 dark:text-white">
              <input
                className="accent-cyan-600 dark:accent-cyan-700"
                type="radio"
                name="deckType"
                value="tshirts"
                checked={deckType === 'tshirts'}
                onChange={() => setDeckType('tshirts')}
              />
              T-shirts XS, S, M, L, XL...
            </label>
            <label className="flex items-center gap-2 dark:text-white">
              <input
                className="accent-cyan-600 dark:accent-cyan-700"
                type="radio"
                name="deckType"
                value="powers"
                checked={deckType === 'powers'}
                onChange={() => setDeckType('powers')}
              />
              Power of 2 0, 1, 2, 4, 8...
            </label>
          </div>
        </div>

        {!createRequesting ? (
          <button
            type="submit"
            className="w-full rounded-md bg-cyan-400 py-2 transition hover:bg-cyan-200 active:bg-cyan-100 dark:bg-cyan-700 dark:text-white dark:hover:bg-cyan-800 dark:active:bg-cyan-900"
          >
            Create Room
          </button>
        ) : (
          <LoadingSpinnerCyan />
        )}
      </form>

      {/* Join Room */}
      <form
        onSubmit={handleJoinRoom}
        className="mb-10 w-full max-w-md space-y-4 rounded-xl p-6 shadow-xl outline-1 backdrop-blur-md dark:bg-zinc-950/70"
      >
        <div className="montserrat text-center text-2xl dark:text-white">
          Join a Room
        </div>

        {joinError && <div className="text-sm text-red-500">{joinError}</div>}

        <div>
          <label className="mb-2 block font-medium dark:text-white">
            Room Code
          </label>
          <input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value)}
            className="w-full rounded-md border px-3 py-2 dark:bg-zinc-700 dark:text-zinc-200"
            placeholder="e.g. abc123"
            required
          />
        </div>

        {!joinRequesting ? (
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-400 py-2 transition hover:bg-emerald-200 active:bg-emerald-100 dark:bg-emerald-700 dark:text-white dark:hover:bg-emerald-800 dark:active:bg-emerald-900"
          >
            Join Room
          </button>
        ) : (
          <LoadingSpinnerEmerald />
        )}
      </form>
    </div>
  )
}

export default RoomJoinCreate
