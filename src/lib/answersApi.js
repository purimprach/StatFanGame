import { checkAnswer } from './answerCheck'
import {
  clearLocalAnswers,
  fetchLocalAnswers,
  insertLocalAnswer,
} from './localAnswersStorage'
import { clearAllWinnerSelections } from './winnerSelection'
import { isSupabaseConfigured, supabase } from './supabase'

export function isUsingLocalDemo() {
  return !isSupabaseConfigured()
}

export async function hasPlayerAnswered({ playerName, gameType, questionKey }) {
  const existing = await fetchPlayerSubmission({ playerName, gameType, questionKey })
  return Boolean(existing)
}

export async function fetchPlayerSubmission({ playerName, gameType, questionKey }) {
  if (!isSupabaseConfigured()) {
    const row = fetchLocalAnswers().find(
      (entry) =>
        entry.player_name === playerName &&
        entry.game_type === gameType &&
        entry.question_key === questionKey,
    )
    if (!row) {
      return null
    }
    return {
      answerText: row.answer_text,
      submittedAt: row.submitted_at,
    }
  }

  const { data, error } = await supabase
    .from('stat_answers')
    .select('answer_text, submitted_at')
    .eq('player_name', playerName)
    .eq('game_type', gameType)
    .eq('question_key', questionKey)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return {
    answerText: data.answer_text,
    submittedAt: data.submitted_at,
  }
}

export async function submitAnswer({
  playerName,
  branch,
  gameType,
  questionKey,
  answerText,
}) {
  if (await hasPlayerAnswered({ playerName, gameType, questionKey })) {
    throw new Error('คุณส่งคำตอบข้อนี้แล้ว ไม่สามารถส่งซ้ำได้')
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
