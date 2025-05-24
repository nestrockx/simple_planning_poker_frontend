import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHome from '../components/ReturnHome'

const CreateJoinRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('')
  const [type, setDeckType] = useState<'default' | 'fibonacci'>('default')
  const [createError, setCreateError] = useState('')

  const [joinRoomCode, setJoinRoomCode] = useState('')
  const [joinError, setJoinError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    api.get('/empty/')
  }, [])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomName.trim()) {
      setCreateError('Room name is required')
      return
    }

    setCreateError('')

    const payload = {
      name: roomName,
      type: type,
    }

    try {
      const response = await api.post('/rooms/', payload, {
        headers: {
          Authorization: `Token ${localStorage.getItem('accessToken')}`,
        },
      })
      if (response.status !== 201) {
        setCreateError('Failed to create room')
        return
      }

      await api.post(
        '/stories/',
        { room_id: response.data.id },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('accessToken')}`,
          },
        },
      )

      const roomCode = response.data.code

      await api.post(
        `/rooms/${roomCode}/join/`,
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('accessToken')}`,
          },
        },
      )

      navigate(`/room/${roomCode}`)
    } catch (error) {
      console.log(error)
      setCreateError('Failed to create room')
      return
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!joinRoomCode.trim()) {
      setJoinError('Room code is required')
      return
    }

    if (joinRoomCode.length !== 6) {
      setJoinError('Room code must be 6 characters long')
      return
    }

    setJoinError('')

    try {
      console.log(localStorage.getItem('accessToken'))
      const response = await api.post(
        `/rooms/${joinRoomCode}/join/`,
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('accessToken')}`,
          },
        },
      )
      if (response.status !== 200) {
        setJoinError("Room doesn't exist")
        return
      }
      navigate(`/room/${joinRoomCode}`)
    } catch (error) {
      console.log(error)
      setJoinError("Room doesn't exist")
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
        className="mt-0 w-full max-w-md space-y-4 rounded-xl bg-zinc-950/70 p-6 shadow-md backdrop-blur-md sm:mt-0"
      >
        <h2 className="text-center text-2xl font-bold text-white">
          Create a Planning Poker Room
        </h2>

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
                type="radio"
                name="deckType"
                value="default"
                checked={type === 'default'}
                onChange={() => setDeckType('default')}
              />
              Default 1, 2, 3, 4, 5, 6...
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                type="radio"
                name="deckType"
                value="fibonacci"
                checked={type === 'fibonacci'}
                onChange={() => setDeckType('fibonacci')}
              />
              Fibonacci 1, 2, 3, 5, 8...
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700"
        >
          Create Room
        </button>
      </form>

      {/* Join Room */}
      <form
        onSubmit={handleJoinRoom}
        className="w-full max-w-md space-y-4 rounded-xl bg-zinc-950/70 p-6 shadow-md backdrop-blur-md"
      >
        <h2 className="text-center text-2xl font-bold text-white">
          Join a Room
        </h2>

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

        <button
          type="submit"
          className="w-full rounded-md bg-green-600 py-2 text-white transition hover:bg-green-700"
        >
          Join Room
        </button>
      </form>
    </div>
  )
}

export default CreateJoinRoom
