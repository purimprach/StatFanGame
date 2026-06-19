import { useEffect, useState } from 'react'
import { playRevealEmphasis, startRevealWait, stopRevealWait } from '../lib/gameSounds'

export const REVEAL_BUILDUP_MS = 3000

export function useRevealAnimation(isActive, replayKey = 0) {
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setContentVisible(false)
      stopRevealWait()
      return undefined
    }

    setContentVisible(false)
    startRevealWait()

    const timer = window.setTimeout(() => {
      stopRevealWait()
      playRevealEmphasis()
      setContentVisible(true)
    }, REVEAL_BUILDUP_MS)

    return () => {
      window.clearTimeout(timer)
      stopRevealWait()
    }
  }, [isActive, replayKey])

  return contentVisible
}
