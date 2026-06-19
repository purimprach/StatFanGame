import { BRANCH_OPTIONS } from './questions'

export const STUDENT_BRANCH_LABELS = {
  BIT: 'BIT',
  INS: 'INS (ประกันภัย)',
  STAT: 'STAT (สถิติ)',
}

export const EMPTY_STUDENT_LISTS = () =>
  Object.fromEntries(BRANCH_OPTIONS.map((branch) => [branch, []]))

export function parseNameLines(text) {
  return [...new Set(text.split('\n').map((line) => line.trim()).filter(Boolean))]
}

export function namesToText(names = []) {
  return names.join('\n')
}

export function flattenStudents(studentsByBranch) {
  return BRANCH_OPTIONS.flatMap((branch) =>
    (studentsByBranch[branch] ?? []).map((name) => ({ name, branch })),
  )
}

export function countStudents(studentsByBranch) {
  return flattenStudents(studentsByBranch).length
}

export function pickRandomEntry(entries) {
  if (entries.length === 0) {
    return null
  }

  return entries[Math.floor(Math.random() * entries.length)]
}
