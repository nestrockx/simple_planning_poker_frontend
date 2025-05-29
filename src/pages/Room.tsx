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
import api from '../api/api'

const Room: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()

  const storiesRef = useRef<Story[]>([])
  const activeStoryRef = useRef<Story | null>(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [stories, setStories] = useState<Story[]>([])
  const [newStory, setNewStory] = useState('')
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [revealVotes, setRevealVotes] = useState(false)
  const [hasAnyVotes, setHasAnyVotes] = useState(false)
  const [roomWebSocket, setRoomWebSocket] = useState<WebSocket | null>(null)
  const [voteType, setVoteType] = useState<string>('default')
  const [participantsVoted, setParticipantsVoted] = useState<
    ParticipantVoted[]
  >([])
  const [userVoteValue, setUserVoteValue] = useState<number | string | null>(
    null,
  )

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
    storiesRef.current = stories
  }, [stories])

  useEffect(() => {
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
  }, [participants])

  useEffect(() => {
    connectToRevealWebSocket()
    fetchRoomData()
  }, [])

  useEffect(() => {
    activeStoryRef.current = activeStory
  }, [activeStory])

  const connectToRevealWebSocket = async () => {
    if (!roomCode) return

    const ws = new WebSocket(
      `wss://${window.location.host}/ws/reveal/${roomCode}/`,
    )

    ws.onopen = () => {}

    ws.onmessage = (event) => {
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
        // handleSetActiveStory(newStory)
      } else if (data.type === 'remove_story') {
        setStories((prevStories) =>
          prevStories.filter((story) => story.id !== data.story.id),
        )
        if (
          activeStoryRef.current?.id === data.story.id &&
          activeStoryRef.current?.id !== storiesRef.current[0].id
        ) {
          handleSetActiveStory(storiesRef.current[0])
        } else if (activeStoryRef.current?.id === data.story.id) {
          handleSetActiveStory(storiesRef.current[1])
        }
      }
    }

    ws.onclose = () => {}

    setRoomWebSocket(ws)

    return () => {
      ws.close()
    }
  }

  const fetchRoomData = async () => {
    api.get(`/rooms/${roomCode}/`).then((roomResponse) => {
      setRoomId(roomResponse.data.id)
      setRoomName(roomResponse.data.name)
      setParticipants(
        [...roomResponse.data.participants].sort((a, b) =>
          a.profile.nickname.localeCompare(b.profile.nickname),
        ),
      )

      setVoteType(roomResponse.data.type)

      console.log('Stories: ' + roomResponse.data.id)
      api.get(`//stories/${roomResponse.data.id}`).then((storiesResponse) => {
        console.log('storiesResponse.data: ', storiesResponse.data)
        setStories(
          storiesResponse.data.map((story: { id: number; title: string }) => ({
            id: story.id,
            title: story.title,
          })),
        )

        if (sessionStorage.getItem('activeRoomCode') === roomCode) {
          const activeStory = sessionStorage.getItem('activeStory')
          if (activeStory === null) {
            handleSetActiveStory(storiesResponse.data[0])
          } else {
            handleSetActiveStory(JSON.parse(activeStory))
          }
        } else {
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
    api.get(`/stories/${story.id}/getstory`).then((response) => {
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
    handleSetActiveStory(story)
  }

  const handleDeleteStory = async (storyId: number) => {
    const title = activeStory?.title

    if (activeStory?.id === storyId && activeStory?.id !== stories[0].id) {
      handleSetActiveStory(stories[0])
    } else if (activeStory?.id === storyId) {
      handleSetActiveStory(stories[1])
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
    api
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
    }
    //setTimeout(() => handleRevealVotes(false), 100)
  }

  const handleSetUserVoteValue = (value: number | string) => {
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
              {participantsVoted.map((participantVoted) => (
                <li
                  key={participantVoted.id}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="relative flex h-22 w-22 items-center justify-center overflow-hidden rounded-2xl border border-b-2 border-neutral-700 bg-gradient-to-br from-neutral-900 to-black shadow-lg">
                    {/* Gloss layer */}
                    <div className="absolute inset-0">
                      {/* Curved glossy highlight */}
                      <div className="absolute top-0 left-0 h-2/3 w-full rounded-b-full bg-white/18 blur-sm" />
                      {/* Bottom subtle glow */}
                      <div className="absolute right-2 bottom-2 h-12 w-12 rounded-full bg-white/8 blur-xl" />
                    </div>
                    {/* Add voting state */}
                    {participantVoted.vote != null ? (
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-800 text-3xl font-bold text-white">
                        {revealVotes ? participantVoted.vote : null}
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-3xl bg-zinc-700" />
                    )}
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
              {getVoteOptions().map((option) => (
                <button
                  key={option}
                  onClick={() => handleSetUserVoteValue(option)}
                  className={`rounded-md py-2 text-center ${
                    userVoteValue === option
                      ? 'bg-emerald-600'
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
