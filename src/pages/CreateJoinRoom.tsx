import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'
import LoadingSpinnerEmerald from '../components/LoadingSpinnerEmerald'
import LoadingSpinnerCyan from '../components/LoadingSpinnerCyan'
import '@fontsource/montserrat/600.css'

const CreateJoinRoom: React.FC = () => {
  const [roomName, setRoomName] = useState<string>('')
  const [deckType, setDeckType] = useState<
    'default' | 'fibonacci' | 'tshirts' | 'powers'
  >('default')
  const [createError, setCreateError] = useState<string>('')
  const [joinRoomCode, setJoinRoomCode] = useState<string>('')
  const [joinError, setJoinError] = useState<string>('')
  const [createRequesting, setCreateRequesting] = useState<boolean>(false)
  const [joinRequesting, setJoinRequesting] = useState<boolean>(false)

  const navigate = useNavigate()

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateRequesting(true)

    if (!roomName.trim()) {
      setCreateError('Room name is required')
      setCreateRequesting(false)
      return
    }

    setCreateError('')

    const roomPayload = {
      name: roomName,
      type: deckType,
    }

    try {
      const response = await api.post('/rooms/', roomPayload)
      if (response.status !== 201) {
        setCreateError('Failed to create room')
        setCreateRequesting(false)
        return
      }

      await api.post('/stories/', { room_id: response.data.id })

      const roomCode = response.data.code

      await api.post(`/rooms/${roomCode}/join/`, {})

      navigate(`/room/${roomCode}`)
    } catch (error) {
      console.log(error)
      setCreateError('Failed to create room')
      setCreateRequesting(false)
      return
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoinRequesting(true)

    if (!joinRoomCode.trim()) {
      setJoinError('Room code is required')
      setJoinRequesting(false)
      return
    }

    if (joinRoomCode.length !== 6) {
      setJoinError('Room code must be 6 characters long')
      setJoinRequesting(false)
      return
    }

    setJoinError('')

    try {
      const response = await api.post(`/rooms/${joinRoomCode}/join/`, {})
      if (response.status !== 200) {
        setJoinError("Room doesn't exist")
        setJoinRequesting(false)
        return
      }
      navigate(`/room/${joinRoomCode}`)
    } catch (error) {
      console.log(error)
      setJoinError("Room doesn't exist")
      setJoinRequesting(false)
      return
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <AccountDropdown />
      <ReturnHome />

      {/* Create Room */}
      <form
        onSubmit={handleCreateRoom}
        className="mt-5 w-full max-w-md space-y-4 rounded-xl bg-zinc-950/70 p-6 shadow-md backdrop-blur-md sm:mt-0"
      >
        <div className="montserrat text-center text-2xl text-white">
          Create a Planning Poker Room
        </div>

        {createError && (
          <div className="text-sm text-red-500">{createError}</div>
        )}

        <div>
          <label className="mb-2 block font-medium text-white">Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full rounded-md border bg-zinc-700 px-3 py-2 text-zinc-200"
            placeholder="e.g. Sprint Planning"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-white">Deck Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-white">
              <input
                className="accent-cyan-700"
                type="radio"
                name="deckType"
                value="default"
                checked={deckType === 'default'}
                onChange={() => setDeckType('default')}
              />
              Default 1, 2, 3, 4, 5, 6...
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                className="accent-cyan-700"
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
            <label className="flex items-center gap-2 text-white">
              <input
                className="accent-cyan-700"
                type="radio"
                name="deckType"
                value="tshirts"
                checked={deckType === 'tshirts'}
                onChange={() => setDeckType('tshirts')}
              />
              T-shirts XS, S, M, L, XL...
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                className="accent-cyan-700"
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
            className="w-full rounded-md bg-cyan-700 py-2 text-white transition hover:bg-cyan-800 active:bg-cyan-900"
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
        className="mb-10 w-full max-w-md space-y-4 rounded-xl bg-zinc-950/70 p-6 shadow-md backdrop-blur-md"
      >
        <div className="montserrat text-center text-2xl text-white">
          Join a Room
        </div>

        {joinError && <div className="text-sm text-red-500">{joinError}</div>}

        <div>
          <label className="mb-2 block font-medium text-white">Room Code</label>
          <input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value)}
            className="w-full rounded-md border bg-zinc-700 px-3 py-2 text-zinc-200"
            placeholder="e.g. abc123"
            required
          />
        </div>

        {!joinRequesting ? (
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-700 py-2 text-white transition hover:bg-emerald-800 active:bg-emerald-900"
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

export default CreateJoinRoom
