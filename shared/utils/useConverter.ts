export function replaceNulls<T>(obj: T): T {
  if (Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj.map(replaceNulls) as any
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        value === null ? undefined : replaceNulls(value)
      ])
    ) as T
  }
  return obj
}
