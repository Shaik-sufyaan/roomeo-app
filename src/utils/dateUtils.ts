/**
 * Date utility functions for chat and messaging components
 */

/**
 * Format timestamp for chat message display
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 24 * 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return `${days[date.getDay()]} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Format timestamp for chat list display
 */
export const formatChatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

  if (diffInMinutes < 1) return 'now'
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`

  const diffInHours = diffInMinutes / 60
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h`

  const diffInDays = diffInHours / 24
  if (diffInDays < 7) return `${Math.floor(diffInDays)}d`

  // For older messages, show the date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/**
 * Check if two timestamps are on the same day
 */
export const isSameDay = (timestamp1: string, timestamp2: string): boolean => {
  const date1 = new Date(timestamp1)
  const date2 = new Date(timestamp2)

  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

/**
 * Format date for message group headers
 */
export const formatDateHeader = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(timestamp, now.toISOString())) {
    return 'Today'
  } else if (isSameDay(timestamp, yesterday.toISOString())) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}