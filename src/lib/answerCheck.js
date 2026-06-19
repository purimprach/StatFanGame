import { ANSWER_KEY } from '../data/answerKey'

export function normalizeAnswer(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getAcceptedAnswers(gameType, questionKey) {
  const entry = ANSWER_KEY[gameType]?.[questionKey]
  if (!entry) {
    return []
  }
  return Array.isArray(entry) ? entry : [entry]
}

export function checkAnswer(gameType, questionKey, answerText) {
  const normalized = normalizeAnswer(answerText)
  if (!normalized) {
    return false
  }

  const accepted = getAcceptedAnswers(gameType, questionKey)
  return accepted.some((candidate) => normalizeAnswer(candidate) === normalized)
}
