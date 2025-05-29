import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'
import '@fontsource/montserrat/600.css'
import ReturnHome from '../components/ReturnHome'

const Home: React.FC = () => {
  const soundRef = useRef<HTMLAudioElement | null>(null)
  const navigate = useNavigate()

  const handleStart = async () => {
    navigate(`/start/`)
  }

  const handleHover = () => {
    if (soundRef.current) {
      soundRef.current.play()
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <ReturnHome />
      {/* <AccountDropdown /> */}
      <div className="mt-14 text-center sm:mt-0">
        <h1
          className="montserrat mt-25 mb-10 text-6xl font-bold text-white sm:mt-0"
          style={{ textShadow: '8px 8px 16px rgba(0, 0, 0, 1.0)' }}
        >
          Welcome to the Simple Planning Poker
        </h1>

        <p
          style={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8)' }}
          className="montserrat mb-10 text-lg font-bold text-zinc-300"
        >
          Simple and fun tool for story points estimation.
        </p>
        <button
          className="glow-on-hover montserrat mb-8 text-base text-zinc-300 sm:mb-0"
          onClick={handleStart}
          onMouseEnter={handleHover}
        >
          Get started
        </button>
      </div>
      <audio ref={soundRef} src="/sounds/hover.wav" preload="auto" />
    </div>
  )
}

export default Home
