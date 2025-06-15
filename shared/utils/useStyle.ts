export function useStyleName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
};

export function useStyleCount(number: number): string {
  return number >= 1000 ? `${(number / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${number}`
}

export function useStyleDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
