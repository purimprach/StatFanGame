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

function toSelection(gameType, questionKey, payload) {
  return {
    gameType,
    questionKey,
    playerName: payload.player_name ?? payload.playerName,
    branch: payload.branch ?? null,
    answerText: payload.answer_text ?? payload.answerText ?? null,
    sourceAnswerId: payload.source_answer_id ?? payload.sourceAnswerId ?? null,
    updatedAt: payload.updated_at ?? payload.updatedAt ?? null,
  }
}

function mapRow(row) {
  if (!row?.game_type || !row?.question_key || !row?.player_name) {
    return null
  }

  return toSelection(row.game_type, row.question_key, row)
}

function notifySelectionChanged() {
  window.dispatchEvent(new Event('stat55-winner-selection'))
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

  const selection = toSelection(gameType, questionKey, payload)

  const local = readLocalSelections()
  local[selectionKey(gameType, questionKey)] = selection
  writeLocalSelections(local)
  notifySelectionChanged()

  if (!isSupabaseConfigured()) {
    return selection
  }

  const { error } = await supabase.from('stat_winner_selection').upsert(payload, {
    onConflict: 'game_type,question_key',
  })

  if (error) {
    throw new Error(
      error.message?.includes('stat_winner_selection')
        ? 'ยังไม่ได้สร้างตาราง stat_winner_selection ใน Supabase — รัน migrate-winner-selection.sql ก่อน'
        : error.message,
    )
  }

  return selection
}

export async function clearWinnerSelection({ gameType, questionKey }) {
  const local = readLocalSelections()
  delete local[selectionKey(gameType, questionKey)]
  writeLocalSelections(local)
  notifySelectionChanged()

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
  notifySelectionChanged()

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
  const local = readLocalSelections()[selectionKey(gameType, questionKey)] ?? null

  if (!isSupabaseConfigured()) {
    return local
  }

  const { data, error } = await supabase
    .from('stat_winner_selection')
    .select('*')
    .eq('game_type', gameType)
    .eq('question_key', questionKey)
    .maybeSingle()

  if (error) {
    return local
  }

  return mapRow(data) ?? local
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
      emitLatest()
    }
  }

  const onLocalChange = () => {
    emitLatest()
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener('stat55-winner-selection', onLocalChange)

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
    window.removeEventListener('stat55-winner-selection', onLocalChange)
    window.clearInterval(pollId)
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}
