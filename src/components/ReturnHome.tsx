import { useNavigate } from 'react-router-dom'

const ReturnHome: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <div
        onClick={() => navigate('/start/')}
        className="absolute top-2 left-2.5 cursor-pointer text-2xl font-bold text-white transition hover:text-zinc-500"
      >
        <img
          src="/images/pokerlogo2.png"
          alt="Logo"
          className="hidden h-22 w-23 dark:block"
        />
        <img
          src="/images/pokerlogo2_black.png"
          alt="Logo"
          className="block h-22 w-23 dark:hidden"
        />
      </div>
    </div>
  )
}

export default ReturnHome
