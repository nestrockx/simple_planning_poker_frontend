import React from 'react'
import { useNavigate } from 'react-router-dom'

const ReturnHome: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <button
        className="absolute top-2 left-2.5 cursor-pointer text-2xl font-bold text-white transition hover:text-zinc-500"
        onClick={() => navigate('/')}
      >
        {/* <GoHomeFill size={32} /> */}
        <img src="/images/pokerlogo2.png" alt="Logo" className="h-22 w-23" />
      </button>
    </div>
  )
}

export default ReturnHome
