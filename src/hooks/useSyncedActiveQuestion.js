import { useEffect, useState } from 'react'
import {
  fetchActiveQuestion,
  isActiveQuestionSyncAvailable,
  subscribeActiveQuestion,
} from '../lib/activeQuestion'

export function useSyncedActiveQuestion() {
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchActiveQuestion()
      .then((current) => {
        if (!cancelled) {
          setActiveQuestion(current)
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActiveQuestion(null)
          setReady(true)
        }
      })

    const unsubscribe = subscribeActiveQuestion((current) => {
      if (!cancelled) {
        setActiveQuestion(current)
        setReady(true)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return {
    activeQuestion,
    ready,
    syncAvailable: isActiveQuestionSyncAvailable(),
  }
}
