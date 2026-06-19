import { getQuestionLabel } from '../data/questions'
import { isSupabaseConfigured, supabase } from './supabase'

const SESSION_ID = 'live'
const LOCAL_KEY = 'stat55_active_question'

function getLocalActiveQuestion() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (!parsed?.gameType || !parsed?.questionKey) {
      return null
    }
    return {
      gameType: parsed.gameType,
      questionKey: parsed.questionKey,
      label: parsed.label ?? getQuestionLabel(parsed.gameType, parsed.questionKey),
      updatedAt: parsed.updatedAt ?? null,
    }
  } catch {
    return null
  }
}

function writeLocalActiveQuestion(payload) {
  if (!payload) {
    localStorage.removeItem(LOCAL_KEY)
    return
  }

  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload))
}

function mapRow(row) {
  if (!row?.game_type || !row?.question_key) {
    return null
  }

  return {
    gameType: row.game_type,
    questionKey: row.question_key,
    label: row.label ?? getQuestionLabel(row.game_type, row.question_key),
    updatedAt: row.updated_at ?? null,
  }
}

export function isActiveQuestionSyncAvailable() {
  return isSupabaseConfigured()
}

export async function setActiveQuestion({ gameType, questionKey, label }) {
  const resolvedLabel = label ?? getQuestionLabel(gameType, questionKey)
  const updatedAt = new Date().toISOString()

  writeLocalActiveQuestion({
    gameType,
    questionKey,
    label: resolvedLabel,
    updatedAt,
  })

  if (!isSupabaseConfigured()) {
    return
  }

  const { error } = await supabase.from('stat_active_question').upsert(
    {
      id: SESSION_ID,
      game_type: gameType,
      question_key: questionKey,
      label: resolvedLabel,
      updated_at: updatedAt,
    },
    { onConflict: 'id' },
  )

  if (error) {
    throw error
  }
}

export async function clearActiveQuestion() {
  writeLocalActiveQuestion(null)

  if (!isSupabaseConfigured()) {
    return
  }

  const { error } = await supabase.from('stat_active_question').upsert(
    {
      id: SESSION_ID,
      game_type: null,
      question_key: null,
      label: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) {
    throw error
  }
}

export async function fetchActiveQuestion() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('stat_active_question')
      .select('game_type, question_key, label, updated_at')
      .eq('id', SESSION_ID)
      .maybeSingle()

    if (error) {
      throw error
    }

    return mapRow(data)
  }

  return getLocalActiveQuestion()
}

export function subscribeActiveQuestion(onChange) {
  let cancelled = false

  const emitLatest = async () => {
    if (cancelled) {
      return
    }

    try {
      const current = await fetchActiveQuestion()
      if (!cancelled) {
        onChange(current)
      }
    } catch {
      if (!cancelled) {
        onChange(getLocalActiveQuestion())
      }
    }
  }

  emitLatest()

  const onStorage = (event) => {
    if (event.key === LOCAL_KEY) {
      onChange(getLocalActiveQuestion())
    }
  }

  window.addEventListener('storage', onStorage)

  const pollMs = isSupabaseConfigured() ? 1000 : 1500
  const pollId = window.setInterval(emitLatest, pollMs)

  let channel
  if (isSupabaseConfigured() && supabase) {
    channel = supabase
      .channel('stat-active-question')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stat_active_question',
          filter: `id=eq.${SESSION_ID}`,
        },
        () => {
          emitLatest()
        },
      )
      .subscribe()
  }

  return () => {
    cancelled = true
    window.removeEventListener('storage', onStorage)
    window.clearInterval(pollId)
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}
