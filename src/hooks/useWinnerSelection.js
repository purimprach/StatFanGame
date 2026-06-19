import { useEffect, useState } from 'react'
import { subscribeWinnerSelection } from '../lib/winnerSelection'

export function useWinnerSelection(gameType, questionKey) {
  const [selection, setSelection] = useState(null)

  useEffect(() => {
    if (!gameType || !questionKey) {
      setSelection(null)
      return undefined
    }

    return subscribeWinnerSelection({ gameType, questionKey }, setSelection)
  }, [gameType, questionKey])

  return selection
}
