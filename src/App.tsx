import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Room from './pages/Room'
import Auth from './pages/Auth'
import Home from './pages/Home'
import CreateJoinRoom from './pages/CreateJoinRoom'
import { FaGithubAlt } from 'react-icons/fa'
import Account from './pages/Account'
import { IoLogoLinkedin } from 'react-icons/io'
import Guest from './pages/Guest'
// import { IoLogoLinkedin } from "react-icons/io";

const App: React.FC = () => {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url(/images/background2.jpg)' }}
    >
      <header>
        <a
          href="https://github.com/nestrockx"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 text-white transition hover:text-zinc-500"
        >
          <FaGithubAlt size={32} />
        </a>
      </header>
      <a
        href="https://www.linkedin.com/in/pawe%C5%82-kraszewski-87b872162/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-15 text-white transition hover:text-zinc-500"
      >
        <IoLogoLinkedin size={32} />
      </a>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomCode" element={<Room />} />
          <Route path="/start" element={<CreateJoinRoom />} />
          <Route path="/account" element={<Account />} />
          <Route path="/guest" element={<Guest />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
