import { ANSWER_KEY } from '../data/answerKey'

/** ต้องมีครบทุกคำในคำตอบ (หลังตัดคำนำหน้า) */
const JIGSAW_ANY_TOKEN_RULES = {
  A: ['ภูริพันธุ์', 'โจ้'],
  B: ['ฐิตา', 'กี้'],
  C: ['อัษฎาพร', 'อัษ', 'อัฐ', 'อัส'],
}

function checkJigsawAnyTokenAnswer(stripped, tokens) {
  return tokens.some((token) => stripped.includes(token))
}

const TITLE_PATTERN =
  /\b(อ\.|อาจารย์|ผศ\.|รศ\.|ศ\.|ดร\.|mr\.|mrs\.|miss\.|prof\.)\b/gi

export function normalizeAnswer(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function stripTitles(text) {
  return normalizeAnswer(text).replace(TITLE_PATTERN, '').replace(/\s+/g, ' ').trim()
}

function getAcceptedAnswers(gameType, questionKey) {
  const entry = ANSWER_KEY[gameType]?.[questionKey]
  if (!entry) {
    return []
  }
  return Array.isArray(entry) ? entry : [entry]
}

function checkJigsawAnswer(questionKey, answerText) {
  const stripped = stripTitles(answerText)
  if (!stripped) {
    return false
  }

  const anyTokens = JIGSAW_ANY_TOKEN_RULES[questionKey]
  if (anyTokens?.length) {
    return checkJigsawAnyTokenAnswer(stripped, anyTokens)
  }

  return false
}

export function checkAnswer(gameType, questionKey, answerText) {
  const normalized = normalizeAnswer(answerText)
  if (!normalized) {
    return false
  }

  if (gameType === 'jigsaw') {
    return checkJigsawAnswer(questionKey, answerText)
  }

  const accepted = getAcceptedAnswers(gameType, questionKey)
  return accepted.some((candidate) => normalizeAnswer(candidate) === normalized)
}
