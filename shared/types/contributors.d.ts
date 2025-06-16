export interface ContributorFetch {
  id?: number
  avatar_url?: string
  login?: string
  html_url?: string
}

export interface Contributor {
  id?: number
  avatar?: {
    src?: string
    alt?: string
  }
  username?: string
  to?: string
}
