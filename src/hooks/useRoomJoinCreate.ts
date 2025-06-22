import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

export const useRoomJoinCreate = () => {
  const [roomName, setRoomName] = useState<string>('')
  const [joinRoomCode, setJoinRoomCode] = useState<string>('')

  const [joinError, setJoinError] = useState<string>('')
  const [createError, setCreateError] = useState<string>('')

  const [joinRequesting, setJoinRequesting] = useState<boolean>(false)
  const [createRequesting, setCreateRequesting] = useState<boolean>(false)

  const [deckType, setDeckType] = useState<
    'default' | 'fibonacci' | 'tshirts' | 'powers'
  >('default')

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

    const roomPayload = { name: roomName, type: deckType }

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
    } catch (err) {
      console.error(err)
      setCreateError('Failed to create room')
      setCreateRequesting(false)
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
    } catch (err) {
      console.error(err)
      setJoinError("Room doesn't exist")
      setJoinRequesting(false)
    }
  }

  return {
    // states
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

    // handlers
    handleCreateRoom,
    handleJoinRoom,
  }
}
