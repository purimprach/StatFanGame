import { useEffect, useState } from 'react'

export function useRevealAnimation(isActive, replayKey = 0) {
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setContentVisible(false)
      return undefined
    }

    setContentVisible(false)
    const timer = window.setTimeout(() => setContentVisible(true), 3000)
    return () => window.clearTimeout(timer)
  }, [isActive, replayKey])

  return contentVisible
}
