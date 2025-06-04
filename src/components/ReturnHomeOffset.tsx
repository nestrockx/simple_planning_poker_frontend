import React from 'react'
import { useNavigate } from 'react-router-dom'

const ReturnHomeOffset: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <div
        onClick={() => navigate('/start/')}
        className="absolute top-4 left-16 cursor-pointer text-2xl font-bold text-white transition hover:text-zinc-500"
      >
        <img src="/images/pokerlogo.png" alt="Logo" className="h-10 w-20" />
      </div>
    </div>
  )
}

export default ReturnHomeOffset
