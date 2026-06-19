import { hintCategories } from './hintGameData'

const JIGSAW_QUESTION_OPTIONS = [
  { gameType: 'jigsaw', questionKey: 'A', label: 'จิ๊กซอว์ A' },
  { gameType: 'jigsaw', questionKey: 'B', label: 'จิ๊กซอว์ B' },
  { gameType: 'jigsaw', questionKey: 'C', label: 'จิ๊กซอว์ C' },
]

const HINT_QUESTION_OPTIONS = hintCategories.map((category, index) => ({
  gameType: 'hint',
  questionKey: String(index + 1),
  label: category.name,
}))

export const QUESTION_OPTIONS = [...JIGSAW_QUESTION_OPTIONS, ...HINT_QUESTION_OPTIONS]

export const BRANCH_OPTIONS = ['BIT', 'INS', 'STAT']

const LEGACY_BRANCH_MAP = {
  สถิติ: 'STAT',
  ประกันภัย: 'INS',
  IS: 'INS',
}

export function normalizeBranch(value) {
  if (!value) {
    return BRANCH_OPTIONS[0]
  }

  if (BRANCH_OPTIONS.includes(value)) {
    return value
  }

  return LEGACY_BRANCH_MAP[value] ?? BRANCH_OPTIONS[0]
}

export function getQuestionLabel(gameType, questionKey) {
  const match = QUESTION_OPTIONS.find(
    (q) => q.gameType === gameType && q.questionKey === questionKey,
  )
  return match?.label ?? `${gameType} ${questionKey}`
}

export function getQuestionValue(gameType, questionKey) {
  return `${gameType}:${questionKey}`
}

export function parseQuestionValue(value) {
  const [gameType, questionKey] = value.split(':')
  return { gameType, questionKey }
}
