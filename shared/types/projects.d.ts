export interface ProjectFetch {
  id?: number
  html_url?: string
  name?: string
  full_name?: string
  description?: string
  owner?: {
    login?: string
    avatar_url?: string
  }
  updated_at?: string
  stargazers_count?: number
  forks_count?: number
  latest_release?: {
    tag?: string
    name?: string
    published_at?: string
    url?: string
    assets?: {
      name?: string
      url?: string
      type?: string
      size?: number
      downloads?: number
    }[]
  }
}

export interface Project {
  id?: number
  to?: string
  name?: string
  fullName?: string
  description?: string
  owner?: {
    src?: string
    alt?: string
  }
  updatedAt?: string
  stars?: number
  forks?: number
  release?: {
    tag?: string
    name?: string
    publishedAt?: string
    url?: string
    assets?: {
      name?: string
      url?: string
      type?: string
      size?: number
      downloads?: number
    }[]
  }
}
