import { Profile } from './Profile'

export interface ParticipantVoted {
  id: number
  username: string
  profile: Profile
  vote: number | null
}
