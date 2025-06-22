import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ParticipantVoted } from '../types/ParticipantVoted'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { Story } from '../types/Story'
import { Participant } from '../types/Participant'
import api from '../api/api'
import { ApiVote } from '../types/ApiVote'
import { WebSocketVote } from '../types/WebSocketVote'
import { useQuery } from '@tanstack/react-query'

export const useRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>()

  const navigate = useNavigate()

  const storiesRef = useRef<Story[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)
  const activeStoryRef = useRef<Story | null>(null)
  const currentUserRef = useRef<Participant>(null)
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null)

  const [error, setError] = useState<string>('')
  const [stories, setStories] = useState<Story[]>([])
  const [newStory, setNewStory] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [summon, setSummon] = useState<string>('Summon')
  const [roomId, setRoomId] = useState<number | null>(null)
  const [voteType, setVoteType] = useState<string>('default')
  const [linkCopied, setLinkCopied] = useState<boolean>(false)
  const [codeCopied, setCodeCopied] = useState<boolean>(false)
  const [revealVotes, setRevealVotes] = useState<boolean>(false)
  const [hasAnyVotes, setHasAnyVotes] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentUser, setCurrentUser] = useState<Participant | null>(null)
  const [websocketConnecting, setWebsocketConnecting] = useState<boolean>(false)
  const [userVoteValue, setUserVoteValue] = useState<number | string | null>(
    null,
  )
  const [participantsVoted, setParticipantsVoted] = useState<
    ParticipantVoted[]
  >([])
  // const [roomWebSocket, setRoomWebSocket] =
  //   useState<ReconnectingWebSocket | null>(null)
  const roomWebSocketRef = useRef<ReconnectingWebSocket | null>(null)

  const query = useQuery({
    queryKey: ['roomData', roomCode!],
    queryFn: async () => {
      setWebsocketConnecting(true)
      await fetchRoomData()
      return true
    },
    enabled: !!roomCode,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const connect = async () => {
      if (query.isSuccess) {
        connectToRoomWebSocket()
      }
    }
    connect()
  }, [query.isSuccess])

  const handleAddP = () => {
    // console.log('Adding participant to the room')

    setTimeout(() => {
      if (roomWebSocketRef.current?.readyState === WebSocket.OPEN) {
        // Send the add_p action to the WebSocket server
        // console.log('Sending add_p action')
        if (activeStory !== null) {
          roomWebSocketRef.current.send(
            JSON.stringify({
              action: 'add_p',
              story_id: activeStory?.id,
            }),
          )
        } else {
          console.warn('No active story to add participant to')
        }
      } else {
        console.warn('WebSocket for add_p not ready yet')
      }
    }, 100)
  }

  const getVoteOptions = () => {
    switch (voteType) {
      case 'fibonacci':
        return [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
      case 'tshirts':
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      case 'powers':
        return [1, 2, 4, 8, 16, 32, 64]
      default: // "default"
        return Array.from({ length: 20 }, (_, i) => i + 1)
    }
  }

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  useEffect(() => {
    storiesRef.current = stories
  }, [stories])

  useEffect(() => {
    activeStoryRef.current = activeStory
  }, [activeStory])

  useEffect(() => {
    const init = async () => {
      setWebsocketConnecting(true)
    }
    init()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = sidebarRef.current
      const hamburgerBtn = hamburgerButtonRef.current
      const target = event.target as Node

      if (
        sidebar &&
        !sidebar.contains(target) &&
        hamburgerBtn &&
        !hamburgerBtn.contains(target)
      ) {
        setIsSidebarOpen(false)
      }
    }

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSidebarOpen])

  useEffect(() => {
    // console.log('participants', participants)
    setParticipantsVoted(
      participants.map((participant) => ({
        ...participant,
        vote: null,
      })),
    )

    if (activeStory?.id != null) {
      api
        .get(`/votes/${activeStory.id}/`)
        .then((response) => {
          setParticipantsVoted((prevParticipants) =>
            prevParticipants.map((participant) => {
              const vote = response.data.find(
                (vote: ApiVote) => vote.user.username === participant.username,
              )
              return {
                ...participant,
                vote: vote ? vote.value : null,
              }
            }),
          )

          setHasAnyVotes(response.data.length > 0)
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }, [activeStory?.id, participants])

  const fetchRoomData = async () => {
    const userResponse = await api.get('/userinfo/')
    const mainUser: Participant = {
      id: userResponse.data.id,
      username: userResponse.data.username,
      profile: {
        nickname: userResponse.data.profile.nickname,
        moderator: userResponse.data.profile.moderator,
      },
    }

    setCurrentUser(mainUser)
    setParticipants((prev) => {
      const exists = prev.find((p) => p.id === mainUser.id)
      return exists
        ? prev
        : [...prev, mainUser].sort((a, b) =>
            a.profile.nickname.localeCompare(b.profile.nickname),
          )
    })

    const roomResponse = await api.get(`/rooms/${roomCode}/`)
    setRoomId(roomResponse.data.id)
    setRoomName(roomResponse.data.name)

    const newParticipants = roomResponse.data.participants
    setParticipants((prev) => {
      const existingIds = new Set(prev.map((p) => p.id))
      const uniqueNew = newParticipants.filter(
        (p: { id: number }) => !existingIds.has(p.id),
      )
      return [...prev, ...uniqueNew].sort((a, b) =>
        a.profile.nickname.localeCompare(b.profile.nickname),
      )
    })

    setVoteType(roomResponse.data.type)

    const storiesResponse = await api.get(`/stories/${roomResponse.data.id}/`)
    const stories = storiesResponse.data.map((story: Story) => ({
      id: story.id,
      title: story.title,
      is_revealed: story.is_revealed,
    }))
    setStories(stories)

    const storedRoom = sessionStorage.getItem('activeRoomCode')
    if (storedRoom === roomCode) {
      const activeStory = sessionStorage.getItem('activeStory')
      handleSetActiveStory(
        activeStory ? JSON.parse(activeStory) : stories[0],
        false,
      )
    } else {
      handleSetActiveStory(stories[0], false)
    }

    return null
  }

  const connectToRoomWebSocket = async () => {
    if (!roomCode) return

    const rws = new ReconnectingWebSocket(
      `ws://localhost:8000/ws/reveal/${roomCode}/`,
      [],
      {
        WebSocket: WebSocket,
        connectionTimeout: 4000,
        maxRetries: 3,
        debug: false,
      },
    )

    rws.onopen = () => {
      console.log('WebSocket connected')
      setWebsocketConnecting(false)
      handleAddP()
    }

    rws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // console.log('WebSocket message received:', data.type)

      switch (data.type) {
        case 'reveal_votes':
          if (activeStoryRef.current?.id !== data.reveal.story_id) {
            return
          }
          setRevealVotes(data.reveal.value)
          break
        case 'reset_votes':
          if (activeStoryRef.current?.id !== data.reset.story_id) {
            return
          }
          setParticipants((prevParticipants) =>
            sortParticipantsByNickname(
              prevParticipants.map((participant) => ({
                ...participant,
                vote: null,
              })),
            ),
          )
          setRevealVotes(false)
          break
        case 'vote_update':
          if (activeStoryRef.current?.id !== data.vote.story_id) {
            return
          }
          handleVoteUpdate(data.vote)
          break
        case 'participant_add':
          if (currentUserRef.current?.id === data.participants.id) {
            console.log('Adding same user')
            return
          }
          console.log('participants.add', data.participants.id)
          api
            .get(`/userinfo/${data.participants.id}/`)
            .then((response) => {
              const newParticipant: Participant = {
                id: response.data.id,
                username: response.data.username,
                profile: {
                  nickname: response.data.profile.nickname,
                  moderator: response.data.profile.moderator,
                },
              }
              setParticipants((prevParticipants) => {
                const existingParticipant = prevParticipants.find(
                  (p) => p.id === newParticipant.id,
                )
                if (existingParticipant) {
                  return prevParticipants
                } else {
                  return [...prevParticipants, newParticipant].sort((a, b) =>
                    a.profile.nickname.localeCompare(b.profile.nickname),
                  )
                }
              })
            })
            .catch((err) => {
              console.log(err)
            })
          break
        case 'participant_remove':
          if (currentUserRef.current?.id === data.participants.id) {
            console.log('Removing same user')
            return
          }
          setParticipants((prevParticipants) => {
            const updatedParticipants = prevParticipants.filter(
              (p) => p.id !== data.participants.id,
            )

            return updatedParticipants
          })
          break
        case 'add_story':
          setStories((prevStories) => [
            ...prevStories,
            {
              id: data.story.id,
              title: data.story.title,
              is_revealed: data.story.is_revealed,
            },
          ])
          break
        case 'remove_story':
          setStories((prevStories) =>
            prevStories.filter((story) => story.id !== data.story.id),
          )
          if (
            activeStoryRef.current?.id === data.story.id &&
            activeStoryRef.current?.id !== storiesRef.current[0].id
          ) {
            handleSetActiveStory(storiesRef.current[0], false)
          } else if (activeStoryRef.current?.id === data.story.id) {
            handleSetActiveStory(storiesRef.current[1], false)
          }
          break
        case 'summon':
          if (activeStoryRef.current?.id !== data.story.id) {
            const newStory: Story = {
              id: data.story.id,
              title: data.story.title,
              is_revealed: data.story.is_revealed,
            }
            handleSetActiveStory(newStory, true)
          } else {
            setSummon('Others joined')
            setTimeout(() => {
              setSummon('Summon')
            }, 1000)
          }
          break
        default:
          console.warn('Unknown WebSocket message type:', data.type)
          break
      }
    }

    rws.onerror = (e) => {
      console.warn('WebSocket error', e)
    }

    rws.onclose = () => {
      setWebsocketConnecting(true)
      console.log('WebSocket closed (will attempt reconnect if needed)')
    }

    // setRoomWebSocket(rws)
    roomWebSocketRef.current = rws

    return () => {
      rws.close()
    }
  }

  const sortParticipantsByNickname = (participants: Participant[]) =>
    [...participants].sort((a, b) =>
      a.profile.nickname.localeCompare(b.profile.nickname),
    )

  const handleSetActiveStory = async (story: Story, change: boolean) => {
    setRevealVotes(false)
    setActiveStory(story)
    sessionStorage.setItem('activeStory', JSON.stringify(story))

    if (change) {
      await api
        .get(`/votes/${story.id}/`)
        .then((response) => {
          setParticipants((prevParticipants) =>
            sortParticipantsByNickname(
              prevParticipants.map((participant) => {
                const vote = response.data.find(
                  (vote: ApiVote) =>
                    vote.user.username === participant.username,
                )
                return {
                  ...participant,
                  vote: vote ? vote.value : null,
                }
              }),
            ),
          )
        })
        .catch((err) => {
          console.error(err)
        })
    }
    await api
      .get(`/stories/${story.id}/getstory`)
      .then((response) => {
        setRevealVotes(response.data.is_revealed)
      })
      .catch((err) => {
        console.error(err)
      })
    // setRevealVotes(story.is_revealed)

    sessionStorage.setItem('activeRoomCode', roomCode || '')
  }

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault()
    const storyInput: string = newStory
    setNewStory('')

    if (!storyInput.trim()) {
      setError('Story name is required')
      return
    }
    setError('')

    const response = await api.post(`/stories/`, {
      room_id: roomId,
      title: storyInput,
    })

    const newStoryItem: Story = {
      id: response.data.id,
      title: response.data.title,
      is_revealed: response.data.is_revealed,
    }
    // setStories((prevStories) => [...prevStories, newStoryItem])

    roomWebSocketRef.current?.send(
      JSON.stringify({
        action: 'add_story',
        story_id: newStoryItem.id,
        title: newStoryItem.title,
      }),
    )
  }

  const handleClickStory = (story: Story) => {
    if (activeStory?.id !== story.id) {
      handleSetActiveStory(story, true)
    }
  }

  const handleDeleteStory = async (storyId: number) => {
    const title = activeStory?.title

    if (activeStory?.id === storyId && activeStory?.id !== stories[0].id) {
      handleSetActiveStory(stories[0], false)
    } else if (activeStory?.id === storyId) {
      handleSetActiveStory(stories[1], false)
    }

    setStories((prevStories) =>
      prevStories.filter((story) => story.id !== storyId),
    )

    await api
      .delete(`/stories/${storyId}/delete/`)
      .then(() => {})
      .catch((err) => {
        console.error(err)
      })
    roomWebSocketRef.current?.send(
      JSON.stringify({
        action: 'remove_story',
        story_id: storyId,
        title: title,
      }),
    )
  }

  const handleVote = () => {
    setIsDialogOpen(true)
  }

  const handleLeaveRoom = () => {
    if (roomWebSocketRef.current?.readyState === WebSocket.OPEN) {
      roomWebSocketRef.current.send(
        JSON.stringify({
          action: 'remove_p',
          story_id: activeStory?.id,
        }),
      )
      navigate('/start/')
    }
  }

  const handleVoteUpdate = (data: WebSocketVote) => {
    const currentActiveStory = activeStoryRef.current
    if (data.story_id === currentActiveStory?.id) {
      setParticipants((prevParticipants) =>
        sortParticipantsByNickname(
          prevParticipants.map((participant) => {
            if (participant.username === data.username) {
              return { ...participant, vote: data.value }
            }
            return participant
          }),
        ),
      )
    }
  }

  const handleConfirmVote = async () => {
    setIsDialogOpen(false)
    await api
      .post(`/votes/`, { story_id: activeStory?.id, value: userVoteValue })
      .then(() => {
        if (roomWebSocketRef.current?.readyState === WebSocket.OPEN) {
          if (activeStory?.id != null) {
            roomWebSocketRef.current.send(
              JSON.stringify({
                action: 'vote',
                story_id: activeStory.id,
                value: userVoteValue,
              }),
            )
          }
        } else {
          console.warn('WebSocket not ready yet')
        }
      })
      .catch((error) => {
        console.error('Error submitting vote:', error)
      })
  }

  const handleRevealVotes = (revealVotesChange: boolean) => {
    if (roomWebSocketRef.current?.readyState === WebSocket.OPEN) {
      if (activeStory?.id != null) {
        if (revealVotesChange) {
          roomWebSocketRef.current.send(
            JSON.stringify({
              story_id: activeStory.id,
              action: 'reveal',
            }),
          )
        } else {
          roomWebSocketRef.current.send(
            JSON.stringify({
              story_id: activeStory.id,
              action: 'unreveal',
            }),
          )
        }
      }
    } else {
      console.warn('WebSocket not ready yet')
    }
  }

  const handleResetVotes = async () => {
    if (roomWebSocketRef.current?.readyState === WebSocket.OPEN) {
      if (activeStory?.id != null) {
        await api
          .delete(`/votes/${activeStory?.id}/delete/`)
          .then(() => {
            setParticipants((prevParticipants) =>
              sortParticipantsByNickname(
                prevParticipants.map((participant) => ({
                  ...participant,
                  vote: null,
                })),
              ),
            )
          })
          .catch((err) => {
            console.error(err)
          })

        roomWebSocketRef.current?.send(
          JSON.stringify({
            story_id: activeStory?.id,
            action: 'reset',
          }),
        )
      }
    } else {
      console.warn('WebSocket not ready yet')
    }
    //setTimeout(() => handleRevealVotes(false), 100)
  }

  const handleSetUserVoteValue = (value: number | string) => {
    sessionStorage.setItem('localUserVoteValue', value.toString())
    setUserVoteValue(value)
  }

  const handleCopyRoomLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        console.log('Room link copied')
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 1000) // Revert after 1s
      })
      .catch((err) => {
        console.error('Failed to copy: ', err)
      })
  }

  const handleCopyRoomCode = () => {
    navigator.clipboard
      .writeText(window.location.href.split('/')[4])
      .then(() => {
        console.log('Room code copied')
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 1000) // Revert after 1s
      })
      .catch((err) => {
        console.error('Failed to copy: ', err)
      })
  }

  const handleSummon = (story: Story) => {
    if (roomWebSocketRef.current?.readyState === WebSocket.OPEN) {
      roomWebSocketRef.current.send(
        JSON.stringify({
          story_id: story.id,
          title: story.title,
          is_revealed: story.is_revealed,
          action: 'summon',
        }),
      )
    } else {
      console.warn('WebSocket not ready yet')
    }
  }

  return {
    // states
    error,
    stories,
    newStory,
    setNewStory,
    roomName,
    summon,
    linkCopied,
    codeCopied,
    revealVotes,
    hasAnyVotes,
    isDialogOpen,
    setIsDialogOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    activeStory,
    websocketConnecting,
    userVoteValue,
    participantsVoted,
    // refs
    sidebarRef,
    hamburgerButtonRef,
    // handle
    handleSetUserVoteValue,
    handleCopyRoomLink,
    handleCopyRoomCode,
    handleSummon,
    handleRevealVotes,
    handleClickStory,
    handleAddStory,
    handleDeleteStory,
    handleResetVotes,
    handleVote,
    handleLeaveRoom,
    handleConfirmVote,
    // param
    roomCode,
    // func
    getVoteOptions,
  }
}
