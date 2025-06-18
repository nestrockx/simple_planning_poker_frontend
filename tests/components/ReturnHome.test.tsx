import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { useNavigate } from 'react-router-dom'
import ReturnHome from '../../src/components/ReturnHome'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('ReturnHome', () => {
  it('renders the logo and navigates on click', async () => {
    const navigate = vi.fn()
    ;(useNavigate as unknown as jest.Mock).mockReturnValue(navigate)

    render(<ReturnHome />)
    const logo = screen.getByAltText('Logo')

    expect(logo).toBeInTheDocument()

    await userEvent.click(logo)
    expect(navigate).toHaveBeenCalledWith('/start/')
  })
})
