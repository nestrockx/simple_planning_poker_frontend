import React, { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Room from './pages/Room'
import Auth from './pages/Auth'
import Home from './pages/Home'
import RoomJoinCreate from './pages/RoomJoinCreate'
import { FaGithubAlt } from 'react-icons/fa'
import Account from './pages/Account'
import { IoLogoLinkedin } from 'react-icons/io'
import Guest from './pages/Guest'
// import { IoLogoLinkedin } from "react-icons/io";

const App: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const root = document.documentElement
    console.log(localStorage.getItem('dark'))
    if (
      localStorage.getItem('dark') === 'false' &&
      root.classList.contains('dark')
    ) {
      root.classList.toggle('dark')
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      const path = window.location.pathname
      if (
        path !== '/login/' &&
        path !== '/login' &&
        path !== '/guest/' &&
        path !== '/guest'
      ) {
        sessionStorage.setItem('afterLoginRedirect', path)
        navigate('/login/')
      }
    }

    window.addEventListener('unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized)
    }
  }, [navigate])

  return (
    <div className="relative min-h-screen bg-white bg-[url()] bg-cover bg-center dark:bg-[url(/images/background3.jpg)]">
      <header>
        <a
          href="https://github.com/nestrockx"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 text-black transition hover:text-zinc-500 dark:text-white"
        >
          <FaGithubAlt size={32} />
        </a>
        <a
          href="https://www.linkedin.com/in/pawe%C5%82-kraszewski-87b872162/"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-15 text-black transition hover:text-zinc-500 dark:text-white"
        >
          <IoLogoLinkedin size={32} />
        </a>
      </header>

      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomCode" element={<Room />} />
        <Route path="/start" element={<RoomJoinCreate />} />
        <Route path="/account" element={<Account />} />
        <Route path="/guest" element={<Guest />} />
      </Routes>

      <footer className="absolute right-0 bottom-0 p-4 text-sm text-zinc-400">
        &copy; Paweł Kraszewski 2025
      </footer>
    </div>
  )
}

export default App
