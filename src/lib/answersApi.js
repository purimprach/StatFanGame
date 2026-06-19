import { checkAnswer } from './answerCheck'
import {
  clearLocalAnswers,
  fetchLocalAnswers,
  insertLocalAnswer,
} from './localAnswersStorage'
import { isSupabaseConfigured, supabase } from './supabase'

export function isUsingLocalDemo() {
  return !isSupabaseConfigured()
}

export async function hasPlayerAnswered({ playerName, gameType, questionKey }) {
  if (!isSupabaseConfigured()) {
    return fetchLocalAnswers().some(
      (row) =>
        row.player_name === playerName &&
        row.game_type === gameType &&
        row.question_key === questionKey,
    )
  }

  const { data, error } = await supabase
    .from('stat_answers')
    .select('id')
    .eq('player_name', playerName)
    .eq('game_type', gameType)
    .eq('question_key', questionKey)
    .limit(1)

  if (error) {
    throw error
  }

  return (data?.length ?? 0) > 0
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
    return { isCorrect, demo: true }
  }

  const { error } = await supabase.from('stat_answers').insert(payload)

  if (error) {
    throw error
  }

  return { isCorrect }
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
    return
  }

  const { error } = await supabase
    .from('stat_answers')
    .delete()
    .neq('player_name', '')

  if (error) {
    throw error
  }
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
