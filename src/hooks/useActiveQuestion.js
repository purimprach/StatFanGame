import { useEffect } from 'react'
import { clearActiveQuestion, setActiveQuestion } from '../lib/activeQuestion'

export function usePreparePlayPage() {
  useEffect(() => {
    clearActiveQuestion().catch((error) => {
      console.error('clearActiveQuestion failed:', error)
    })

    return () => {
      clearActiveQuestion().catch((error) => {
        console.error('clearActiveQuestion failed:', error)
      })
    }
  }, [])
}

export function useBroadcastActiveQuestion(gameType, questionKey, label, enabled = true) {
  useEffect(() => {
    if (!enabled || !gameType || !questionKey) {
      return undefined
    }

    setActiveQuestion({ gameType, questionKey, label }).catch((error) => {
      console.error('setActiveQuestion failed:', error)
    })

    return () => {
      clearActiveQuestion().catch((error) => {
        console.error('clearActiveQuestion failed:', error)
      })
    }
  }, [gameType, questionKey, label, enabled])
}

export async function startLiveQuestion({ gameType, questionKey, label }) {
  await setActiveQuestion({ gameType, questionKey, label })
}

export function useClearActiveQuestion() {
  useEffect(() => {
    clearActiveQuestion().catch((error) => {
      console.error('clearActiveQuestion failed:', error)
    })
  }, [])
}
