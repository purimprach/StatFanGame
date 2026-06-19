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

export function saveSubmission({ gameType, questionKey, answerText, submittedAt }) {
  if (getSubmission(gameType, questionKey)) {
    return getSubmission(gameType, questionKey)
  }

  const entry = {
    gameType,
    questionKey,
    answerText: answerText.trim(),
    submittedAt: submittedAt ?? new Date().toISOString(),
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...getPlayerSubmissions(), entry]),
  )

  return entry
}
