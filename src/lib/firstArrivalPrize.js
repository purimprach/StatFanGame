import { isSupabaseConfigured, supabase } from './supabase'

const LOCAL_KEY = 'stat55_first_arrival_prize'
const ROW_ID = 'live'

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal(value) {
  if (value) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(value))
  } else {
    localStorage.removeItem(LOCAL_KEY)
  }
}

function mapRow(row) {
  if (!row?.display_name?.trim()) {
    return null
  }

  return {
    displayName: row.display_name.trim(),
    studentId: row.student_id?.trim() || null,
    branch: row.branch?.trim() || null,
    arrivedAt: row.arrived_at?.trim() || null,
    updatedAt: row.updated_at ?? null,
  }
}

function notifyChanged() {
  window.dispatchEvent(new Event('stat55-first-arrival-prize'))
}

export async function saveFirstArrivalPrize({
  displayName,
  studentId = null,
  branch = null,
  arrivedAt = null,
}) {
  const trimmedName = displayName?.trim()
  if (!trimmedName) {
    throw new Error('กรุณากรอกชื่อ-นามสกุล')
  }

  const payload = {
    id: ROW_ID,
    display_name: trimmedName,
    student_id: studentId?.trim() || null,
    branch: branch?.trim() || null,
    arrived_at: arrivedAt?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  const setting = mapRow(payload)
  writeLocal(setting)
  notifyChanged()

  if (!isSupabaseConfigured()) {
    return setting
  }

  const { error } = await supabase.from('stat_first_arrival_prize').upsert(payload, {
    onConflict: 'id',
  })

  if (error) {
    throw new Error(
      error.message?.includes('stat_first_arrival_prize')
        ? 'ยังไม่ได้สร้างตาราง stat_first_arrival_prize ใน Supabase — รัน migrate-first-arrival-prize.sql ก่อน'
        : error.message,
    )
  }

  return setting
}

export async function clearFirstArrivalPrize() {
  writeLocal(null)
  notifyChanged()

  if (!isSupabaseConfigured()) {
    return
  }

  const { error } = await supabase.from('stat_first_arrival_prize').delete().eq('id', ROW_ID)

  if (error) {
    throw error
  }
}

export async function fetchFirstArrivalPrize() {
  const local = readLocal()

  if (!isSupabaseConfigured()) {
    return local
  }

  const { data, error } = await supabase
    .from('stat_first_arrival_prize')
    .select('*')
    .eq('id', ROW_ID)
    .maybeSingle()

  if (error) {
    return local
  }

  return mapRow(data) ?? local
}

export function subscribeFirstArrivalPrize(onChange) {
  let cancelled = false

  const emitLatest = async () => {
    if (cancelled) {
      return
    }

    try {
      const current = await fetchFirstArrivalPrize()
      if (!cancelled) {
        onChange(current)
      }
    } catch {
      if (!cancelled) {
        onChange(readLocal())
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
  window.addEventListener('stat55-first-arrival-prize', onLocalChange)

  const pollId = window.setInterval(emitLatest, isSupabaseConfigured() ? 1000 : 1500)

  let channel
  if (isSupabaseConfigured() && supabase) {
    channel = supabase
      .channel('stat-first-arrival-prize')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stat_first_arrival_prize',
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
    window.removeEventListener('stat55-first-arrival-prize', onLocalChange)
    window.clearInterval(pollId)
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}
