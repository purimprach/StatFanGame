const STORAGE_KEY = 'stat55_player_submissions'

export function getPlayerSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getSubmissions(gameType, questionKey) {
  return getPlayerSubmissions()
    .filter((entry) => entry.gameType === gameType && entry.questionKey === questionKey)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}

export function getSubmission(gameType, questionKey) {
  return getSubmissions(gameType, questionKey)[0] ?? null
}

export function saveSubmission({ gameType, questionKey, answerText, submittedAt }) {
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

export function syncSubmissions(gameType, questionKey, remoteSubmissions) {
  const others = getPlayerSubmissions().filter(
    (entry) => !(entry.gameType === gameType && entry.questionKey === questionKey),
  )

  const synced = remoteSubmissions.map((submission) => ({
    gameType,
    questionKey,
    answerText: submission.answerText,
    submittedAt: submission.submittedAt,
  }))

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, ...synced]))
  return getSubmissions(gameType, questionKey)
}
