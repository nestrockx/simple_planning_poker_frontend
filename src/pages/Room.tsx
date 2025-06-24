import { X } from 'lucide-react'
import AccountDropdown from '../components/AccountDropdown'
import ReturnHomeOffset from '../components/ReturnHomeOffset'
import { IoIosLink } from 'react-icons/io'
import { FaRegCopy } from 'react-icons/fa'
import { IoCheckmarkCircle } from 'react-icons/io5'
import LoadingSpinnerEmerald from '../components/LoadingSpinnerEmerald'
import { useRoom } from '../hooks/useRoom'
import DarkModeButton from '../components/DarkModeButton'

const Room: React.FC = () => {
  const {
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
    handleConfirmVote,
    // param
    roomCode,
    // func
    getVoteOptions,
  } = useRoom()

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
      {/* Dark Mode Button */}
      <DarkModeButton />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`absolute top-0 left-0 z-50 h-full w-70 transform rounded-e-3xl bg-zinc-900/10 shadow-lg outline-1 backdrop-blur-lg transition-transform duration-300 dark:bg-zinc-900/60 dark:text-white dark:outline-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Home Button */}
        <h2 className="mb-4 px-16 pt-6 pb-2 text-xl font-bold text-black dark:text-white">
          Stories
        </h2>
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
          className={`block h-[0.2rem] w-7 rounded-md bg-black transition-transform duration-300 dark:bg-white ${
            isSidebarOpen ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`block h-[0.2rem] w-7 rounded-md bg-black transition-opacity duration-300 dark:bg-white ${
            isSidebarOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`block h-[0.2rem] w-7 rounded-md bg-black transition-transform duration-300 dark:bg-white ${
            isSidebarOpen ? '-translate-y-2.5 -rotate-45' : ''
          }`}
        />
      </button>

      {/* Main Content */}
      <div className="mt-10 flex-1 p-6">
        <h2 className="text-lg text-white">
          <div className="flex gap-3 text-black dark:text-white">
            <span className="montserrat font-bold">Code:</span>
            {roomCode}
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
                } text-emerald-700 dark:text-emerald-200`}
              />

              {/* Checkmark Icon */}
              <IoCheckmarkCircle
                className={`absolute top-1 left-0 h-full w-full transition-opacity duration-300 ${
                  codeCopied ? 'opacity-100' : 'pointer-events-none opacity-0'
                } text-emerald-700 dark:text-emerald-200`}
              />
            </div>
          </div>
          <div className="flex gap-2 text-black dark:text-white">
            <span className="montserrat font-bold">Room:</span>
            {roomName}
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
                } text-emerald-700 dark:text-emerald-200`}
              />

              {/* Checkmark Icon */}
              <IoCheckmarkCircle
                className={`absolute top-1 left-0 h-full w-full transition-opacity duration-300 ${
                  linkCopied ? 'opacity-100' : 'pointer-events-none opacity-0'
                } text-emerald-700 dark:text-emerald-200`}
              />
            </div>
          </div>
          <div className="flex gap-3 text-black dark:text-white">
            <span className="montserrat font-bold">Story:</span>
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
                  <span className="mt-2 text-lg text-black dark:text-white">
                    {participantVoted.profile.nickname}
                  </span>
                </li>
              ))}
            </ul>
            {/* Reveal Votes Button under boxes */}
            <div className="mt-6 flex flex-col items-center space-y-3">
              <button
                className="rounded-md border-2 border-emerald-700 bg-zinc-100 px-4 py-2 text-black hover:bg-emerald-400 active:bg-emerald-700 disabled:border-0 disabled:bg-zinc-600 disabled:opacity-50 dark:bg-zinc-950 dark:text-white dark:hover:bg-emerald-900 dark:active:bg-emerald-700"
                onClick={() => handleRevealVotes(!revealVotes)}
                disabled={!hasAnyVotes}
              >
                {revealVotes ? 'Hide Votes' : 'Reveal Votes'}
              </button>
              {!revealVotes && <span className="mb-18" />}

              {revealVotes && (
                <button
                  className="mb-3 rounded-md border-2 border-rose-800 bg-zinc-100 px-4 py-2 text-black hover:bg-rose-400 active:bg-rose-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-rose-950 dark:active:bg-rose-800"
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
