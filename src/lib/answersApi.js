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

export async function submitAnswer({
  playerName,
  branch,
  gameType,
  questionKey,
  answerText,
}) {
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
