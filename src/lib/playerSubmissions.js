const STORAGE_KEY = 'stat55_player_submissions'

export function getPlayerSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getSubmission(gameType, questionKey) {
  return (
    getPlayerSubmissions().find(
      (entry) => entry.gameType === gameType && entry.questionKey === questionKey,
    ) ?? null
  )
}

export function saveSubmission({ gameType, questionKey, answerText }) {
  if (getSubmission(gameType, questionKey)) {
    return null
  }

  const entry = {
    gameType,
    questionKey,
    answerText: answerText.trim(),
    submittedAt: new Date().toISOString(),
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...getPlayerSubmissions(), entry]),
  )

  return entry
}
