import { checkAnswer } from './answerCheck'
import {
  clearLocalAnswers,
  fetchLocalAnswers,
  insertLocalAnswer,
} from './localAnswersStorage'
import { clearAllWinnerSelections } from './winnerSelection'
import { isSupabaseConfigured, supabase } from './supabase'

export const MAX_ANSWER_ATTEMPTS = 2

export function isUsingLocalDemo() {
  return !isSupabaseConfigured()
}

export async function hasPlayerAnswered({ playerName, gameType, questionKey }) {
  const count = await getPlayerSubmissionCount({ playerName, gameType, questionKey })
  return count >= MAX_ANSWER_ATTEMPTS
}

export async function getPlayerSubmissionCount({ playerName, gameType, questionKey }) {
  const submissions = await fetchPlayerSubmissions({ playerName, gameType, questionKey })
  return submissions.length
}

export async function fetchPlayerSubmissions({ playerName, gameType, questionKey }) {
  if (!isSupabaseConfigured()) {
    return fetchLocalAnswers()
      .filter(
        (entry) =>
          entry.player_name === playerName &&
          entry.game_type === gameType &&
          entry.question_key === questionKey,
      )
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .map((row) => ({
        answerText: row.answer_text,
        submittedAt: row.submitted_at,
      }))
  }

  const { data, error } = await supabase
    .from('stat_answers')
    .select('answer_text, submitted_at')
    .eq('player_name', playerName)
    .eq('game_type', gameType)
    .eq('question_key', questionKey)
    .order('submitted_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => ({
    answerText: row.answer_text,
    submittedAt: row.submitted_at,
  }))
}

export async function fetchPlayerSubmission({ playerName, gameType, questionKey }) {
  const submissions = await fetchPlayerSubmissions({ playerName, gameType, questionKey })
  return submissions[0] ?? null
}

export async function submitAnswer({
  playerName,
  branch,
  gameType,
  questionKey,
  answerText,
}) {
  if (await hasPlayerAnswered({ playerName, gameType, questionKey })) {
    throw new Error(`คุณส่งครบ ${MAX_ANSWER_ATTEMPTS} ครั้งแล้ว`)
  }

  const isCorrect = checkAnswer(gameType, questionKey, answerText)
  const payload = {
    player_name: playerName,
    branch: branch || null,
    game_type: gameType,
    question_key: questionKey,
    answer_text: answerText.trim(),
    is_correct: isCorrect,
    submitted_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured()) {
    insertLocalAnswer(payload)
    return { isCorrect, submittedAt: payload.submitted_at, demo: true }
  }

  const { error } = await supabase.from('stat_answers').insert(payload)

  if (error) {
    throw error
  }

  return { isCorrect, submittedAt: payload.submitted_at }
}

export async function fetchAllAnswers() {
  if (!isSupabaseConfigured()) {
    return fetchLocalAnswers()
  }

  const { data, error } = await supabase
    .from('stat_answers')
    .select('*')
    .order('submitted_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function clearAllAnswers() {
  if (!isSupabaseConfigured()) {
    clearLocalAnswers()
    await clearAllWinnerSelections()
    return
  }

  const { error } = await supabase
    .from('stat_answers')
    .delete()
    .neq('player_name', '')

  if (error) {
    throw error
  }

  await clearAllWinnerSelections()
}

export function sortAnswers(rows) {
  return [...rows].sort((a, b) => {
    if (a.is_correct !== b.is_correct) {
      return a.is_correct ? -1 : 1
    }

    if (a.is_correct && b.is_correct) {
      return new Date(a.submitted_at) - new Date(b.submitted_at)
    }

    return new Date(b.submitted_at) - new Date(a.submitted_at)
  })
}

export async function fetchFastestCorrectAnswer({ gameType, questionKey }) {
  const rows = await fetchAllAnswers()
  const correctAnswers = rows.filter(
    (row) =>
      row.game_type === gameType &&
      row.question_key === questionKey &&
      row.is_correct,
  )

  if (correctAnswers.length === 0) {
    return null
  }

  correctAnswers.sort(
    (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
  )

  const fastest = correctAnswers[0]

  return {
    playerName: fastest.player_name,
    branch: fastest.branch,
    submittedAt: fastest.submitted_at,
  }
}
