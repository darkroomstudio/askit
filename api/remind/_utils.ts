export function getMinuteUntil(targetTime: number) {
  // all times are in UTC
  const target = new Date()
  target.setUTCHours(targetTime)

  const now = new Date()
  const diff = target.getTime() - now.getTime()

  const minutes = Math.floor(diff / 1000 / 60)
  return minutes
}
