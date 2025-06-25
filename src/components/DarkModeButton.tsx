import React, { useEffect, useState } from 'react'
import { FaMoon } from 'react-icons/fa6'
import { MdWbSunny } from 'react-icons/md'

const DarkModeButton: React.FC = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (localStorage.getItem('dark')) {
      setDark(localStorage.getItem('dark') === 'true')
    } else {
      setDark(root.classList.contains('dark'))
    }
  }, [])

  const toggleDarkMode = () => {
    const root = document.documentElement
    root.classList.toggle('dark')
    localStorage.setItem('dark', root.classList.contains('dark').toString())
    setDark(root.classList.contains('dark'))
  }

  return (
    <div className="absolute top-3.5 right-35">
      <button
        onClick={toggleDarkMode}
        className="rounded px-4 py-1.5 transition-colors duration-200 hover:bg-zinc-200 active:bg-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-800"
      >
        {dark ? (
          <FaMoon size={24} color="#ffffdd" />
        ) : (
          <MdWbSunny size={24} color="#333300" />
        )}
      </button>
    </div>
  )
}

export default DarkModeButton
