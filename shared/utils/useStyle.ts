export function useStyleName(name: string | undefined): string | undefined {
  if (!name) return undefined

  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
};

export function useStyleCount(number: number | undefined): string | undefined {
  if (!number) return undefined

  return number >= 1000 ? `${(number / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${number}`
}

export function useStyleDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined

  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
