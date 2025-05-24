import { useEffect, useRef, useState } from 'react'
import api from '../api/api'
import { useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHomeOffset from '../components/ReturnHomeOffset'
import { Story } from '../models/Story'
import { Participant } from '../models/Participant'
import { ParticipantVoted } from '../models/ParticipantVoted'
import { ApiVote } from '../models/ApiVote'
import { WebSocketVote } from '../models/WebSocketVote'

const Room: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()

  const activeStoryRef = useRef<Story | null>(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [stories, setStories] = useState<Story[]>([])
  const [newStory, setNewStory] = useState('')
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [participantsVoted, setParticipantsVoted] = useState<
    ParticipantVoted[]
  >([])

  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [roomName, setRoomName] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userVoteValue, setUserVoteValue] = useState<number | null>(null)

  // const [revealVotesValue, setRevealVotesValue] = useState(false);
  const [revealVotes, setRevealVotes] = useState(false)

  const [hasAnyVotes, setHasAnyVotes] = useState(false)

  const [voteSocket, setVoteSocket] = useState<WebSocket | null>(null)
  // const [participantSocket, setparticipantSocket] = useState<WebSocket | null>(
  //   null,
  // )
  const [revealSocket, setRevealSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    setParticipantsVoted(
      participants.map((participant) => ({
        ...participant,
        vote: null,
      })),
    )

    if (activeStory?.id != null) {
      api.get(`/votes/${activeStory.id}/`).then((response) => {
        console.log('Votes:', response.data)
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

      console.log('Participants voted:', participantsVoted)
    }
  }, [participants])

  useEffect(() => {
    connectToParticipantWebSocket()
    connectToVoteWebSocket()
    connectToRevealWebSocket()
    fetchRoomData()
  }, [])

  useEffect(() => {
    activeStoryRef.current = activeStory
  }, [activeStory])

  const connectToParticipantWebSocket = async () => {
    if (!roomCode) return

    const ws = new WebSocket(
      `ws://localhost:8000/ws/participant/${roomCode}/?token=${localStorage.getItem(
        'accessToken',
      )}`,
    )

    ws.onopen = () => {
      console.log('Participant WebSocket connected')
    }

    ws.onmessage = (event) => {
      console.log('Participant WebSocket message received:', event.data)
      const data = JSON.parse(event.data)
      console.log('Participant Data', data)

      if (data.type === 'participant_add') {
        api.get(`/userinfo/${data.participants.id}/`).then((response) => {
          console.log('Participant data:', response.data)
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
              console.log('Participant already exists:', existingParticipant)
              return prevParticipants
            } else {
              console.log('New participant added:', newParticipant)
              return [...prevParticipants, newParticipant].sort((a, b) =>
                a.profile.nickname.localeCompare(b.profile.nickname),
              )
            }
          })
        })
      } else if (data.type === 'participant_remove') {
        setParticipants((prevParticipants) => {
          const updatedParticipants = prevParticipants.filter(
            (p) => p.id !== data.participants.id,
          )
          console.log('Participant removed:', data.participants)
          return updatedParticipants
        })
      }
    }

    ws.onclose = () => {
      console.log('Participant WebSocket disconnected')
    }

    return () => {
      ws.close()
    }
  }

  const connectToVoteWebSocket = async () => {
    if (!roomCode) return

    const ws = new WebSocket(
      `ws://localhost:8000/ws/room/${roomCode}/?token=${localStorage.getItem(
        'accessToken',
      )}`,
    )

    ws.onopen = () => {
      console.log('Vote WebSocket connected')
    }

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data)
      const data = JSON.parse(event.data)

      handleVoteUpdate(data)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    setVoteSocket(ws)

    return () => {
      ws.close()
    }
  }

  const connectToRevealWebSocket = async () => {
    if (!roomCode) return

    const ws = new WebSocket(
      `ws://localhost:8000/ws/reveal/${roomCode}/?token=${localStorage.getItem(
        'accessToken',
      )}`,
    )

    ws.onopen = () => {
      console.log('Reveal WebSocket connected')
    }

    ws.onmessage = (event) => {
      console.log('Reveal WebSocket message received:', event.data)
      const data = JSON.parse(event.data)

      if (data.type === 'reveal_votes') {
        if (activeStoryRef.current?.id !== data.reveal.story_id) {
          console.log('Active story ID does not match')
          return
        }

        console.log('Reveal data:', data)
        setRevealVotes(data.reveal.value)
      } else if (data.type === 'reset_votes') {
        if (activeStoryRef.current?.id !== data.reset.story_id) {
          console.log('Active story ID does not match')
          return
        }

        console.log('Reset data:', data)
        setParticipants((prevParticipants) =>
          sortParticipantsByNickname(
            prevParticipants.map((participant) => ({
              ...participant,
              vote: null,
            })),
          ),
        )

        setRevealVotes(false)
      }
    }

    ws.onclose = () => {
      console.log('Reveal WebSocket disconnected')
    }

    setRevealSocket(ws)

    return () => {
      ws.close()
    }
  }

  const fetchRoomData = async () => {
    api.get(`/rooms/${roomCode}/`).then((roomResponse) => {
      console.log('Room data:', roomResponse.data)
      setRoomId(roomResponse.data.id)
      setRoomName(roomResponse.data.name)
      setParticipants(
        [...roomResponse.data.participants].sort((a, b) =>
          a.profile.nickname.localeCompare(b.profile.nickname),
        ),
      )

      api.get(`/stories/${roomResponse.data.id}`).then((storiesResponse) => {
        console.log('Stories:', storiesResponse.data)
        setStories((prevStories) => [
          ...prevStories,
          ...storiesResponse.data.map(
            (story: { id: number; title: string }) => ({
              id: story.id,
              title: story.title,
            }),
          ),
        ])

        if (sessionStorage.getItem('activeRoomCode') === roomCode) {
          const activeStory = sessionStorage.getItem('activeStory')
          if (activeStory === null) {
            console.log('No active story found in sessionStorage')
            handleSetActiveStory(storiesResponse.data[0])
          } else {
            console.log('Active story found in sessionStorage:', activeStory)
            handleSetActiveStory(JSON.parse(activeStory))
          }
        } else {
          console.log('No active room found in sessionStorage')
          handleSetActiveStory(storiesResponse.data[0])
        }
      })
    })
  }

  const sortParticipantsByNickname = (participants: Participant[]) =>
    [...participants].sort((a, b) =>
      a.profile.nickname.localeCompare(b.profile.nickname),
    )

  const handleSetActiveStory = async (story: Story) => {
    setRevealVotes(false)
    setActiveStory(story)
    sessionStorage.setItem('activeStory', JSON.stringify(story))
    console.log(`Active story: ${story.id} ${story.title}`)

    await api.get(`/votes/${story.id}/`).then((response) => {
      console.log('Votes:', response.data)
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
    api.get(`/stories/${story.id}/getstory`).then((response) => {
      console.log('Story details:', response.data)
      setRevealVotes(response.data.is_revealed)
    })

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

    const newStoryItem = {
      id: response.data.id,
      title: response.data.title,
      is_revealed: response.data.is_revealed,
    }
    setStories((prevStories) => [...prevStories, newStoryItem])
  }

  const handleClickStory = (story: Story) => {
    handleSetActiveStory(story)
  }

  const handleDeleteStory = async (storyId: number) => {
    console.log('Active story:', activeStory?.id)
    if (activeStory?.id === storyId && activeStory?.id !== stories[0].id) {
      handleSetActiveStory(stories[0])
    } else if (activeStory?.id === storyId) {
      handleSetActiveStory(stories[1])
    }

    setStories((prevStories) =>
      prevStories.filter((story) => story.id !== storyId),
    )

    api.delete(`/stories/${storyId}/delete/`).then((response) => {
      console.log('Delete story:', response.data)
    })
  }

  const handleVote = () => {
    console.log('Voting dialog opening')
    setIsDialogOpen(true)
  }

  const handleVoteUpdate = (data: WebSocketVote) => {
    console.log('Vote update received:', data)
    console.log('Data story ID:', data.story_id)
    console.log('Active story ID:', activeStoryRef.current?.id)

    const currentActiveStory = activeStoryRef.current
    if (data.story_id === currentActiveStory?.id) {
      setParticipants((prevParticipants) =>
        sortParticipantsByNickname(
          prevParticipants.map((participant) => {
            if (participant.username === data.username) {
              console.log('User vote found:', data.value)
              return { ...participant, vote: data.value }
            }
            return participant
          }),
        ),
      )
    }
  }

  const handleConfirmVote = async () => {
    console.log('User voted:', userVoteValue)
    setIsDialogOpen(false)
    api
      .post(`/votes/`, { story_id: activeStory?.id, value: userVoteValue })
      .then((response) => {
        console.log('Vote submitted:', response.data)
        if (voteSocket?.readyState === WebSocket.OPEN) {
          if (activeStory?.id != null) {
            voteSocket.send(
              JSON.stringify({
                story_id: activeStory.id,
                value: userVoteValue,
              }),
            )
          }
        } else {
          console.warn('Vote WebSocket not ready yet')
        }
      })
      .catch((error) => {
        console.error('Error submitting vote:', error)
      })
  }

  const handleRevealVotes = (revealVotesChange: boolean) => {
    if (revealSocket?.readyState === WebSocket.OPEN) {
      if (activeStory?.id != null) {
        if (revealVotesChange) {
          revealSocket.send(
            JSON.stringify({
              story_id: activeStory.id,
              action: 'reveal',
            }),
          )
        } else {
          revealSocket.send(
            JSON.stringify({
              story_id: activeStory.id,
              action: 'unreveal',
            }),
          )
        }
      }
    } else {
      console.warn('Reveal WebSocket not ready yet')
    }
  }

  const handleResetVotes = async () => {
    if (revealSocket?.readyState === WebSocket.OPEN) {
      if (activeStory?.id != null) {
        await api
          .delete(`/votes/${activeStory?.id}/delete/`)
          .then((response) => {
            console.log('Reset votes:', response.data)
            setParticipants((prevParticipants) =>
              sortParticipantsByNickname(
                prevParticipants.map((participant) => ({
                  ...participant,
                  vote: null,
                })),
              ),
            )
          })

        revealSocket?.send(
          JSON.stringify({
            story_id: activeStory?.id,
            action: 'reset',
          }),
        )
      }
    }
    //setTimeout(() => handleRevealVotes(false), 100)
  }

  const handleSetUserVoteValue = (value: number) => {
    sessionStorage.setItem('localUserVoteValue', value.toString())
    setUserVoteValue(value)
  }

  return (
    <div className="flex min-h-screen">
      {/* Account Dropdown */}
      <AccountDropdown />
      {/* Return Home Button */}
      <ReturnHomeOffset />

      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 z-50 h-full w-70 transform bg-[rgba(24,24,24,0.6)] text-white shadow-lg backdrop-blur-md transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Home Button */}
        <h2 className="mb-4 px-16 pt-6 pb-2 text-xl font-bold">Stories</h2>
        <div className="h-[calc(100vh-200px)] overflow-y-auto px-6">
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
                  className="flex-1 truncate p-2"
                  onClick={() => handleClickStory(story)}
                >
                  {story.title}
                </span>
                {stories.length > 1 && (
                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="ml-3 p-2 text-white hover:text-zinc-700 active:text-zinc-950"
                    title="Delete story"
                  >
                    <X />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Story Form */}
        <form onSubmit={handleAddStory} className="mt-4 px-6">
          {error && <div className="text-sm text-red-500">{error}</div>}
          <input
            type="text"
            value={newStory}
            onChange={(e) => setNewStory(e.target.value)}
            className="w-full rounded bg-zinc-600 p-2 text-white"
            placeholder="New Story"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-emerald-600 py-2 text-white transition hover:bg-emerald-700"
          >
            Add Story
          </button>
        </form>
      </div>

      {/* Hamburger Button */}
      <button
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
        <h1 className="text-xl text-white">
          <b>Room:</b> {roomName} <br />
          <b>Story:</b> {activeStory?.title}
        </h1>
        <div className="flex items-center justify-center">
          <div className="mt-6">
            <ul className="flex flex-wrap gap-4">
              {participantsVoted.map((participant) => (
                <li
                  key={participant.id}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="relative flex h-22 w-22 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-black shadow-[inset_0_1px_4px_rgba(255,255,255,0.5),_0_0_8px_rgba(255,255,255,0.2)]">
                    {/* Metallic highlight with harder gradient stops */}
                    <div className="pointer-events-none absolute top-0 left-0 h-full w-full rounded-2xl bg-gradient-to-br from-white/50 via-white/10 to-transparent mix-blend-screen" />
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-zinc-600">
                      {/* Add voting state */}
                      {participant.vote != null ? (
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-800 text-3xl font-bold text-white">
                          {revealVotes ? participant.vote : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <span className="mt-2 text-lg text-white">
                    {participant.profile.nickname}
                  </span>
                </li>
              ))}
            </ul>
            {/* Reveal Votes Button under boxes */}
            <div className="mt-6 flex flex-col items-center space-y-3">
              <button
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-zinc-600 disabled:opacity-50"
                onClick={() => handleRevealVotes(!revealVotes)}
                disabled={!hasAnyVotes}
              >
                {revealVotes ? 'Hide Votes' : 'Reveal Votes'}
              </button>
              {!revealVotes && <span className="mb-10" />}

              {revealVotes && (
                <button
                  className="rounded-md bg-rose-800 px-4 py-2 text-white hover:bg-rose-900"
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
      <div className="fixed bottom-0 left-[calc(50%)] mb-6 -translate-x-1/2 transform">
        {!revealVotes && (
          <button
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
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
              {Array.from({ length: 20 }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => handleSetUserVoteValue(number)}
                  className={`rounded-md py-2 text-center ${
                    userVoteValue === number
                      ? 'bg-emerald-600'
                      : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  {number}
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
                className="rounded bg-emerald-600 px-4 py-2 hover:bg-emerald-700 disabled:opacity-50"
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
