import React, { useState } from 'react'
import api from '../api/api'

const DeleteUserDataForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await api.post('/delete-user-data/', {
        username,
        password,
      })

      if (response.status === 200) {
        setMessage('User and associated data deleted successfully.')
      } else {
        setMessage('Failed to delete user.')
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-red-600">
          Delete Simple Planning Poker Account
        </h2>

        {message && (
          <div
            className={`mb-4 rounded p-2 ${
              message.includes('successfully')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </form>
    </div>
  )
}

export default DeleteUserDataForm
