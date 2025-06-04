import { useNavigate } from 'react-router-dom'

const ReturnHome: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <div
        onClick={() => navigate('/start/')}
        className="absolute top-2 left-2.5 cursor-pointer text-2xl font-bold text-white transition hover:text-zinc-500"
      >
        <img src="/images/pokerlogo2.png" alt="Logo" className="h-22 w-23" />
      </div>
    </div>
  )
}

export default ReturnHome
