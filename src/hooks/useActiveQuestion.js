import { useEffect } from 'react'
import { clearActiveQuestion, setActiveQuestion } from '../lib/activeQuestion'

export function useBroadcastActiveQuestion(gameType, questionKey, label) {
  useEffect(() => {
    if (!gameType || !questionKey) {
      return undefined
    }

    setActiveQuestion({ gameType, questionKey, label }).catch(() => {})

    return () => {
      clearActiveQuestion().catch(() => {})
    }
  }, [gameType, questionKey, label])
}

export function useClearActiveQuestion() {
  useEffect(() => {
    clearActiveQuestion().catch(() => {})
  }, [])
}
