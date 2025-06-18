import { User } from './User'

export interface ApiVote {
  id: number
  story_id: number
  user: User
  value: number | null
}
