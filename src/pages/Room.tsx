import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHomeOffset from '../components/ReturnHomeOffset'
import { Story } from '../models/Story'
import { Participant } from '../models/Participant'
import { ParticipantVoted } from '../models/ParticipantVoted'
import { ApiVote } from '../models/ApiVote'
import { WebSocketVote } from '../models/WebSocketVote'
import { IoIosLink } from 'react-icons/io'
import { FaRegCopy } from 'react-icons/fa'
import { IoCheckmarkCircle } from 'react-icons/io5'
import api from '../api/api'
import ReconnectingWebSocket from 'reconnecting-websocket'
import LoadingSpinnerEmerald from '../components/LoadingSpinnerEmerald'

const Room: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()

  const storiesRef = useRef<Story[]>([])
  const activeStoryRef = useRef<Story | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null)
  const currentUserRef = useRef<Participant>(null)

  const [currentUser, setCurrentUser] = useState<Participant | null>(null)
  const [summon, setSummon] = useState<string>('Summon')
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [stories, setStories] = useState<Story[]>([])
  const [newStory, setNewStory] = useState<string>('')
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [error, setError] = useState<string>('')
  const [roomId, setRoomId] = useState<number | null>(null)
  const [roomName, setRoomName] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [revealVotes, setRevealVotes] = useState<boolean>(false)
  const [hasAnyVotes, setHasAnyVotes] = useState<boolean>(false)
  const [roomWebSocket, setRoomWebSocket] =
    useState<ReconnectingWebSocket | null>(null)
  const [voteType, setVoteType] = useState<string>('default')
  const [linkCopied, setLinkCopied] = useState<boolean>(false)
  const [codeCopied, setCodeCopied] = useState<boolean>(false)
  const [participantsVoted, setParticipantsVoted] = useState<
    ParticipantVoted[]
  >([])
  const [userVoteValue, setUserVoteValue] = useState<number | string | null>(
    null,
  )
  const [websocketConnecting, setWebsocketConnecting] = useState<boolean>(false)

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
      await fetchRoomData()
      connectToRevealWebSocket()
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
    console.log('participants', participants)
    setParticipantsVoted(
      participants.map((participant) => ({
        ...participant,
        vote: null,
      })),
    )

    if (activeStory?.id != null) {
      api.get(`/votes/${activeStory.id}/`).then((response) => {
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
    }
  }, [activeStory?.id, participants])

  const fetchRoomData = async () => {
    await api.get('/userinfo/').then((response) => {
      const mainUser: Participant = {
        id: response.data.id,
        username: response.data.username,
        profile: {
          nickname: response.data.profile.nickname,
          moderator: response.data.profile.moderator,
        },
      }
      setCurrentUser(mainUser)
      setParticipants((prevParticipants) => {
        const existingParticipant = prevParticipants.find(
          (p) => p.id === mainUser.id,
        )
        if (existingParticipant) {
          return prevParticipants
        } else {
          return [...prevParticipants, mainUser].sort((a, b) =>
            a.profile.nickname.localeCompare(b.profile.nickname),
          )
        }
      })
    })

    await api.get(`/rooms/${roomCode}/`).then(async (roomResponse) => {
      setRoomId(roomResponse.data.id)
      setRoomName(roomResponse.data.name)
      console.log('rooms participants:', roomResponse.data.participants)
      setParticipants((prevParticipants) => {
        const newParticipants = [...roomResponse.data.participants]
        const existingIds = new Set(prevParticipants.map((p) => p.id))
        const uniqueNewParticipants = newParticipants.filter(
          (p) => !existingIds.has(p.id),
        )
        const updatedList = [
          ...prevParticipants,
          ...uniqueNewParticipants,
        ].sort((a, b) => a.profile.nickname.localeCompare(b.profile.nickname))
        return updatedList
      })

      setVoteType(roomResponse.data.type)

      await api
        .get(`/stories/${roomResponse.data.id}/`)
        .then((storiesResponse) => {
          setStories(
            storiesResponse.data.map(
              (story: { id: number; title: string; is_revealed: string }) => ({
                id: story.id,
                title: story.title,
                is_revealed: story.is_revealed,
              }),
            ),
          )

          if (sessionStorage.getItem('activeRoomCode') === roomCode) {
            const activeStory = sessionStorage.getItem('activeStory')
            if (activeStory === null) {
              handleSetActiveStory(storiesResponse.data[0], false)
            } else {
              handleSetActiveStory(JSON.parse(activeStory), false)
            }
          } else {
            handleSetActiveStory(storiesResponse.data[0], false)
          }
        })
    })
  }

  const connectToRevealWebSocket = async () => {
    if (!roomCode) return

    const rws = new ReconnectingWebSocket(
      `wss://${window.location.host}/ws/reveal/${roomCode}/`,
      [],
      {
        WebSocket: WebSocket,
        connectionTimeout: 4000,
        maxRetries: Infinity,
        debug: false,
      },
    )

    rws.onopen = () => {
      console.log('WebSocket connected')
      setWebsocketConnecting(false)
    }

    rws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'reveal_votes') {
        if (activeStoryRef.current?.id !== data.reveal.story_id) {
          return
        }
        setRevealVotes(data.reveal.value)
      } else if (data.type === 'reset_votes') {
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
      } else if (data.type === 'vote_update') {
        if (activeStoryRef.current?.id !== data.vote.story_id) {
          return
        }

        handleVoteUpdate(data.vote)
      } else if (data.type === 'participant_add') {
        if (currentUserRef.current?.id === data.participants.id) {
          console.log('Adding same user')
          return
        }
        console.log('participants.add', data.participants.id)
        api.get(`/userinfo/${data.participants.id}/`).then((response) => {
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
      } else if (data.type === 'participant_remove') {
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
      } else if (data.type === 'add_story') {
        const newStory: Story = {
          id: data.story.id,
          title: data.story.title,
          is_revealed: data.story.is_revealed,
        }
        setStories((prevStories) => [...prevStories, newStory])
      } else if (data.type === 'remove_story') {
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
      } else if (data.type === 'summon') {
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
      }
    }

    rws.onerror = (e) => {
      console.warn('WebSocket error', e)
    }

    rws.onclose = () => {
      setWebsocketConnecting(true)
      console.log('WebSocket closed (will attempt reconnect if needed)')
    }

    setRoomWebSocket(rws)

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
      await api.get(`/votes/${story.id}/`).then((response) => {
        setParticipants((prevParticipants) =>
          sortParticipantsByNickname(
            prevParticipants.map((participant) => {
              const vote = response.data.find(
                (vote: ApiVote) => vote.user.username === participant.username,
              )
              return {
                ...participant,
                vote: vote ? vote.value : null,
              }
            }),
          ),
        )
      })
    }
    await api.get(`/stories/${story.id}/getstory`).then((response) => {
      setRevealVotes(response.data.is_revealed)
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

    roomWebSocket?.send(
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

    await api.delete(`/stories/${storyId}/delete/`).then(() => {})
    roomWebSocket?.send(
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
        if (roomWebSocket?.readyState === WebSocket.OPEN) {
          if (activeStory?.id != null) {
            roomWebSocket.send(
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
    if (roomWebSocket?.readyState === WebSocket.OPEN) {
      if (activeStory?.id != null) {
        if (revealVotesChange) {
          roomWebSocket.send(
            JSON.stringify({
              story_id: activeStory.id,
              action: 'reveal',
            }),
          )
        } else {
          roomWebSocket.send(
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
    if (roomWebSocket?.readyState === WebSocket.OPEN) {
      if (activeStory?.id != null) {
        await api.delete(`/votes/${activeStory?.id}/delete/`).then(() => {
          setParticipants((prevParticipants) =>
            sortParticipantsByNickname(
              prevParticipants.map((participant) => ({
                ...participant,
                vote: null,
              })),
            ),
          )
        })

        roomWebSocket?.send(
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
    if (roomWebSocket?.readyState === WebSocket.OPEN) {
      roomWebSocket.send(
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

  return (
    <div className="flex min-h-screen">
      {websocketConnecting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black opacity-80">
          <div className="text-xl font-semibold text-white">Connecting...</div>
          <div className="px-5">
            <LoadingSpinnerEmerald />
          </div>
        </div>
      )}

      {/* Account Dropdown */}
      <AccountDropdown />
      {/* Return Home Button */}
      <ReturnHomeOffset />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`absolute top-0 left-0 z-50 h-full w-70 transform rounded-e-3xl bg-[rgba(24,24,24,0.6)] text-white shadow-lg backdrop-blur-md transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Home Button */}
        <h2 className="mb-4 px-16 pt-6 pb-2 text-xl font-bold">Stories</h2>
        <div className="h-[calc(100%-200px)] overflow-y-auto px-6">
          <div className="space-y-2">
            {stories.map((story) => (
              <div
                key={story.id}
                className={`flex cursor-pointer items-center justify-between rounded text-white ${
                  activeStory?.id === story.id
                    ? 'bg-emerald-700'
                    : 'bg-zinc-600 hover:bg-zinc-500'
                }`}
              >
                <span
                  className="flex-1 truncate p-2 text-lg"
                  onClick={() => handleClickStory(story)}
                >
                  {story.title}
                </span>
                {stories.length > 1 && (
                  <div className="flex gap-0">
                    {activeStory?.id === story.id && (
                      <button
                        onClick={() => {
                          handleSummon(story)
                        }}
                        className="my-1 rounded-xl px-2 py-1 text-sm hover:bg-emerald-950 active:bg-black"
                        title="Gather all participants to vote"
                      >
                        {summon}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="ml-0 p-2 text-white hover:text-emerald-950 active:text-black"
                      title="Delete story"
                    >
                      <X />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Story Form */}
        <form onSubmit={handleAddStory} className="px-6">
          <input
            type="text"
            value={newStory}
            onChange={(e) => setNewStory(e.target.value)}
            className="mt-4 w-full rounded bg-zinc-600 p-2 text-white"
            placeholder="New Story"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-emerald-600 py-2 text-white transition hover:bg-emerald-700"
          >
            Add Story
          </button>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </form>
      </div>

      {/* Hamburger Button */}
      <button
        ref={hamburgerButtonRef}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-7 left-6 z-50 flex h-[1.3rem] w-8 flex-col justify-between focus:outline-none"
      >
        <span
          className={`block h-[0.2rem] w-7 rounded-md bg-white transition-transform duration-300 ${
            isSidebarOpen ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`block h-[0.2rem] w-7 rounded-md bg-white transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`block h-[0.2rem] w-7 rounded-md bg-white transition-transform duration-300 ${
            isSidebarOpen ? '-translate-y-2.5 -rotate-45' : ''
          }`}
        />
      </button>

      {/* Main Content */}
      <div className="mt-10 flex-1 p-6">
        <h2 className="text-lg text-white">
          <div className="flex gap-3">
            <span className="montserrat font-bold">Code: </span> {roomCode}
            <div className="group relative h-[20px] w-[20px]">
              {/* Tooltip */}
              <div className="pointer-events-none absolute top-8 left-1/2 z-50 -translate-x-1/2 rounded bg-zinc-700 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-1000 group-hover:opacity-100">
                Copy room code
              </div>

              {/* Copy Icon */}
              <FaRegCopy
                onClick={handleCopyRoomCode}
                className={`absolute top-1 left-0 h-full w-full cursor-pointer transition-opacity duration-300 ${
                  codeCopied ? 'pointer-events-none opacity-0' : 'opacity-100'
                } text-emerald-200`}
              />

              {/* Checkmark Icon */}
              <IoCheckmarkCircle
                className={`absolute top-1 left-0 h-full w-full transition-opacity duration-300 ${
                  codeCopied ? 'opacity-100' : 'pointer-events-none opacity-0'
                } text-emerald-200`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <span className="montserrat font-bold">Room:</span> {roomName}
            <div className="group relative h-[24px] w-[24px]">
              {/* Tooltip */}
              <div className="pointer-events-none absolute top-8 left-1/2 z-50 -translate-x-1/2 rounded bg-zinc-700 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-1000 group-hover:opacity-100">
                Copy room link
              </div>

              {/* Link Icon */}
              <IoIosLink
                onClick={handleCopyRoomLink}
                className={`absolute top-1 left-0 h-full w-full cursor-pointer transition-opacity duration-300 ${
                  linkCopied ? 'pointer-events-none opacity-0' : 'opacity-100'
                } text-emerald-200`}
              />

              {/* Checkmark Icon */}
              <IoCheckmarkCircle
                className={`absolute top-1 left-0 h-full w-full transition-opacity duration-300 ${
                  linkCopied ? 'opacity-100' : 'pointer-events-none opacity-0'
                } text-emerald-200`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <span className="montserrat font-bold">Story: </span>
            {activeStory?.title}
          </div>
        </h2>
        <div className="flex items-center justify-center p-5">
          <div className="mt-6">
            <ul className="flex flex-wrap justify-center gap-4">
              {participantsVoted.map((participantVoted) => (
                <li
                  key={participantVoted.id}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="relative flex h-22 w-22 items-center justify-center overflow-hidden rounded-2xl border border-b-4 border-neutral-700 bg-gradient-to-br from-neutral-900 to-black shadow-lg">
                    {/* Gloss layer */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute top-0 left-0 h-2/3 w-full rounded-b-full bg-white/18 blur-sm" />
                      <div className="absolute right-2 bottom-2 h-12 w-12 rounded-full bg-white/8 blur-xl" />
                    </div>

                    {/* Vote background bubble */}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-3xl transition-all duration-500 ${
                        participantVoted.vote != null
                          ? 'bg-emerald-800'
                          : 'bg-zinc-700'
                      }`}
                    >
                      {/* Vote number with fade in/out */}
                      <span
                        className={`text-3xl font-bold text-white transition-opacity duration-500 select-none ${
                          revealVotes && participantVoted.vote != null
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      >
                        {participantVoted.vote}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 text-lg text-white">
                    {participantVoted.profile.nickname}
                  </span>
                </li>
              ))}
            </ul>
            {/* Reveal Votes Button under boxes */}
            <div className="mt-6 flex flex-col items-center space-y-3">
              <button
                className="rounded-md border-2 border-emerald-700 bg-zinc-950 px-4 py-2 text-white hover:bg-emerald-900 active:bg-emerald-700 disabled:border-0 disabled:bg-zinc-600 disabled:opacity-50"
                onClick={() => handleRevealVotes(!revealVotes)}
                disabled={!hasAnyVotes}
              >
                {revealVotes ? 'Hide Votes' : 'Reveal Votes'}
              </button>
              {!revealVotes && <span className="mb-18" />}

              {revealVotes && (
                <button
                  className="mb-3 rounded-md border-2 border-rose-800 bg-zinc-950 px-4 py-2 text-white hover:bg-rose-950 active:bg-rose-800"
                  onClick={() => handleResetVotes()}
                >
                  Reset Votes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Fixed Vote Button at the bottom */}
      <div className="absolute bottom-0 left-[calc(50%)] mb-6 -translate-x-1/2 transform">
        {!revealVotes && (
          <button
            className="mb-8 rounded-md bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
            onClick={handleVote}
          >
            Vote
          </button>
        )}
      </div>
      {/* Floating Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm">
          <div className="w-80 rounded-lg bg-zinc-800 p-6 text-white shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Select your vote</h3>

            <div className="mb-4 grid grid-cols-5 gap-2">
              {getVoteOptions().map((option) => (
                <button
                  key={option}
                  onClick={() => handleSetUserVoteValue(option)}
                  className={`rounded-md py-2 text-center ${
                    userVoteValue === option
                      ? 'bg-emerald-700'
                      : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="rounded bg-gray-500 px-4 py-2 hover:bg-gray-600"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-emerald-700 px-4 py-2 hover:bg-emerald-800 disabled:opacity-50"
                onClick={handleConfirmVote}
                disabled={userVoteValue === null}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Room
