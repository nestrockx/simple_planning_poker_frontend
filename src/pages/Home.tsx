import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'
import '@fontsource/montserrat/600.css'
import ReturnHome from '../components/ReturnHome'
import DarkModeButtonOffset from '../components/DarkModeButtonOffset'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const soundRef = useRef<HTMLAudioElement | null>(null)

  const handleStart = async () => {
    navigate(`/start/`)
  }

  const handleHover = () => {
    if (soundRef.current) {
      soundRef.current.play()
    }
  }

  return (
    <div className="flex items-center justify-center">
      <ReturnHome />
      <DarkModeButtonOffset />

      {/* <AccountDropdown /> */}
      <div className="mt-[18vh] text-center sm:mt-[38vh]">
        <h1 className="montserrat mt-25 mb-10 px-5 text-5xl font-bold text-black sm:mt-0 dark:text-white dark:text-shadow-[8px_8px_16px_rgba(0_0_0_/_1.0)]">
          Welcome to the Simple Planning Poker
        </h1>
        <p className="montserrat mb-10 px-5 text-lg font-bold text-black dark:text-zinc-300 dark:text-shadow-[4px_4px_8px_rgba(0_0_0_/_0.8)]">
          Simple and fun tool for story points estimation.
        </p>
        <button
          className="glow-on-hover montserrat mb-16 text-base font-bold sm:mb-40 dark:text-zinc-300"
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
