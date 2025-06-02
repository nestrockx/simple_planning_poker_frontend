import React from 'react'

const ReturnHomeOffset: React.FC = () => {
  return (
    <div>
      <a
        href="/start/"
        className="absolute top-4 left-16 cursor-pointer text-2xl font-bold text-white transition hover:text-zinc-500"
      >
        <img src="/images/pokerlogo.png" alt="Logo" className="h-10 w-20" />
      </a>
    </div>
  )
}

export default ReturnHomeOffset
