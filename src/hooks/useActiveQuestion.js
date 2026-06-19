import { useEffect } from 'react'
import { clearActiveQuestion, setActiveQuestion } from '../lib/activeQuestion'

export function useBroadcastActiveQuestion(gameType, questionKey, label, enabled = true) {
  useEffect(() => {
    if (!enabled || !gameType || !questionKey) {
      clearActiveQuestion().catch(() => {})
      return undefined
    }

    setActiveQuestion({ gameType, questionKey, label }).catch(() => {})

    return () => {
      clearActiveQuestion().catch(() => {})
    }
  }, [gameType, questionKey, label, enabled])
}

export function useClearActiveQuestion() {
  useEffect(() => {
    clearActiveQuestion().catch(() => {})
  }, [])
}
