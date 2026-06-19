import { isSupabaseConfigured, supabase } from './supabase'

const LOCAL_KEY = 'stat55_winner_selection'

function selectionKey(gameType, questionKey) {
  return `${gameType}:${questionKey}`
}

function readLocalSelections() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocalSelections(map) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map))
}

function mapRow(row) {
  if (!row?.game_type || !row?.question_key || !row?.player_name) {
    return null
  }

  return {
    gameType: row.game_type,
    questionKey: row.question_key,
    playerName: row.player_name,
    branch: row.branch ?? null,
    answerText: row.answer_text ?? null,
    sourceAnswerId: row.source_answer_id ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

export async function setWinnerSelection({
  gameType,
  questionKey,
  playerName,
  branch = null,
  answerText = null,
  sourceAnswerId = null,
}) {
  const payload = {
    game_type: gameType,
    question_key: questionKey,
    player_name: playerName.trim(),
    branch,
    answer_text: answerText?.trim() || null,
    source_answer_id: sourceAnswerId,
    updated_at: new Date().toISOString(),
  }

  const local = readLocalSelections()
  local[selectionKey(gameType, questionKey)] = {
    gameType,
    questionKey,
    playerName: payload.player_name,
    branch,
    answerText: payload.answer_text,
    sourceAnswerId,
    updatedAt: payload.updated_at,
  }
  writeLocalSelections(local)

  if (!isSupabaseConfigured()) {
    return
  }

  const { error } = await supabase.from('stat_winner_selection').upsert(payload, {
    onConflict: 'game_type,question_key',
  })

  if (error) {
    throw error
  }
}

export async function clearWinnerSelection({ gameType, questionKey }) {
  const local = readLocalSelections()
  delete local[selectionKey(gameType, questionKey)]
  writeLocalSelections(local)

  if (!isSupabaseConfigured()) {
    return
  }

  const { error } = await supabase
    .from('stat_winner_selection')
    .delete()
    .eq('game_type', gameType)
    .eq('question_key', questionKey)

  if (error) {
    throw error
  }
}

export async function clearAllWinnerSelections() {
  writeLocalSelections({})

  if (!isSupabaseConfigured()) {
    return
  }

  const { error } = await supabase
    .from('stat_winner_selection')
    .delete()
    .neq('game_type', '')

  if (error) {
    throw error
  }
}

export async function fetchWinnerSelection({ gameType, questionKey }) {
  const local = readLocalSelections()[selectionKey(gameType, questionKey)]
  if (!isSupabaseConfigured()) {
    return local ?? null
  }

  const { data, error } = await supabase
    .from('stat_winner_selection')
    .select('*')
    .eq('game_type', gameType)
    .eq('question_key', questionKey)
    .maybeSingle()

  if (error) {
    throw error
  }

  return mapRow(data) ?? local ?? null
}

export async function fetchDeclaredWinner({ gameType, questionKey }) {
  const selection = await fetchWinnerSelection({ gameType, questionKey })
  if (!selection) {
    return null
  }

  return {
    playerName: selection.playerName,
    branch: selection.branch,
    answerText: selection.answerText,
    submittedAt: selection.updatedAt,
  }
}

export function subscribeWinnerSelection({ gameType, questionKey }, onChange) {
  if (!gameType || !questionKey) {
    onChange(null)
    return () => {}
  }

  let cancelled = false

  const emitLatest = async () => {
    if (cancelled) {
      return
    }

    try {
      const current = await fetchWinnerSelection({ gameType, questionKey })
      if (!cancelled) {
        onChange(current)
      }
    } catch {
      if (!cancelled) {
        const local = readLocalSelections()[selectionKey(gameType, questionKey)] ?? null
        onChange(local)
      }
    }
  }

  emitLatest()

  const onStorage = (event) => {
    if (event.key === LOCAL_KEY) {
      const local = readLocalSelections()[selectionKey(gameType, questionKey)] ?? null
      onChange(local)
    }
  }

  window.addEventListener('storage', onStorage)

  const pollId = window.setInterval(emitLatest, isSupabaseConfigured() ? 1000 : 1500)

  let channel
  if (isSupabaseConfigured() && supabase) {
    channel = supabase
      .channel(`stat-winner-${gameType}-${questionKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stat_winner_selection',
          filter: `game_type=eq.${gameType}`,
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
