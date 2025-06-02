import React from 'react'

const ReturnHome: React.FC = () => {
  return (
    <div>
      <a
        href="/"
        className="absolute top-2 left-2.5 cursor-pointer text-2xl font-bold text-white transition hover:text-zinc-500"
      >
        <img src="/images/pokerlogo2.png" alt="Logo" className="h-22 w-23" />
      </a>
    </div>
  )
}

export default ReturnHome
