import { BRANCH_OPTIONS } from '../data/questions'
import { EMPTY_STUDENT_LISTS } from '../data/randomDrawData'
import { REGISTRATION_STUDENT_LISTS } from '../data/studentRegistrationLists'
import { REGISTRATION_TEACHER_LISTS } from '../data/teacherRegistrationLists'
import { isSupabaseConfigured, supabase } from './supabase'

const LOCAL_KEY = 'stat55_draw_lists'
const ROW_ID = 'live'

function normalizeStudents(value) {
  const base = EMPTY_STUDENT_LISTS()

  if (!value || typeof value !== 'object') {
    return base
  }

  for (const branch of BRANCH_OPTIONS) {
    const names = value[branch]
    if (Array.isArray(names)) {
      base[branch] = names.map((name) => String(name).trim()).filter(Boolean)
    }
  }

  return base
}

function normalizeTeachers(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((name) => String(name).trim()).filter(Boolean)
}

function mapRow(row) {
  const students = normalizeStudents(row?.students)
  const teachers = normalizeTeachers(row?.teachers)
  const studentsEmpty = BRANCH_OPTIONS.every((branch) => students[branch].length === 0)
  const teachersEmpty = teachers.length === 0

  return {
    students: studentsEmpty ? normalizeStudents(REGISTRATION_STUDENT_LISTS) : students,
    teachers: teachersEmpty ? [...REGISTRATION_TEACHER_LISTS] : teachers,
    updatedAt: row?.updated_at ?? null,
    usingRegistrationFallback: studentsEmpty,
    usingTeacherRegistrationFallback: teachersEmpty,
  }
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? mapRow(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function writeLocal(value) {
  if (value) {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({
        students: value.students,
        teachers: value.teachers,
        updated_at: value.updatedAt,
      }),
    )
  } else {
    localStorage.removeItem(LOCAL_KEY)
  }
}

function notifyChanged() {
  window.dispatchEvent(new Event('stat55-draw-lists'))
}

export async function saveDrawLists({ students, teachers }) {
  const payload = {
    id: ROW_ID,
    students: normalizeStudents(students),
    teachers: normalizeTeachers(teachers),
    updated_at: new Date().toISOString(),
  }

  const setting = mapRow(payload)
  writeLocal(setting)
  notifyChanged()

  if (!isSupabaseConfigured()) {
    return setting
  }

  const { error } = await supabase.from('stat_draw_lists').upsert(payload, {
    onConflict: 'id',
  })

  if (error) {
    throw new Error(
      error.message?.includes('stat_draw_lists')
        ? 'ยังไม่ได้สร้างตาราง stat_draw_lists ใน Supabase — รัน migrate-draw-lists.sql ก่อน'
        : error.message,
    )
  }

  return setting
}

export async function fetchDrawLists() {
  const local = readLocal()

  if (!isSupabaseConfigured()) {
    return local ?? mapRow({})
  }

  const { data, error } = await supabase
    .from('stat_draw_lists')
    .select('*')
    .eq('id', ROW_ID)
    .maybeSingle()

  if (error) {
    return local ?? mapRow({})
  }

  return data ? mapRow(data) : local ?? mapRow({})
}

export function subscribeDrawLists(onChange) {
  let cancelled = false

  const emitLatest = async () => {
    if (cancelled) {
      return
    }

    try {
      const current = await fetchDrawLists()
      if (!cancelled) {
        onChange(current)
      }
    } catch {
      if (!cancelled) {
        onChange(readLocal() ?? mapRow({}))
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
  window.addEventListener('stat55-draw-lists', onLocalChange)

  const pollId = window.setInterval(emitLatest, isSupabaseConfigured() ? 1000 : 1500)

  let channel
  if (isSupabaseConfigured() && supabase) {
    channel = supabase
      .channel('stat-draw-lists')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stat_draw_lists',
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
    window.removeEventListener('stat55-draw-lists', onLocalChange)
    window.clearInterval(pollId)
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}
