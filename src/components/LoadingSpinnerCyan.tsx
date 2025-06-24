import React from 'react'

const LoadingSpinnerCyan: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent dark:border-cyan-700 dark:border-t-transparent"></div>
      </div>
    </div>
  )
}

export default LoadingSpinnerCyan
