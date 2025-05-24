import React from 'react'
import { useNavigate } from 'react-router-dom'

const ReturnHomeOffset: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <button
        className="absolute top-4 left-16 cursor-pointer text-2xl font-bold text-white transition hover:text-zinc-500"
        onClick={() => navigate('/')}
      >
        {/* <GoHomeFill size={32} /> */}
        <img src="/images/pokerlogo.png" alt="Logo" className="h-10 w-20" />
      </button>
    </div>
  )
}

export default ReturnHomeOffset
