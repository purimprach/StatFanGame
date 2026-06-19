export const QUESTION_OPTIONS = [
  { gameType: 'jigsaw', questionKey: 'A', label: 'จิ๊กซอว์ A' },
  { gameType: 'jigsaw', questionKey: 'B', label: 'จิ๊กซอว์ B' },
  { gameType: 'jigsaw', questionKey: 'C', label: 'จิ๊กซอว์ C' },
  { gameType: 'hint', questionKey: '1', label: 'คำใบ้ 1' },
  { gameType: 'hint', questionKey: '2', label: 'คำใบ้ 2' },
  { gameType: 'hint', questionKey: '3', label: 'คำใบ้ 3' },
  { gameType: 'hint', questionKey: '4', label: 'คำใบ้ 4' },
  { gameType: 'hint', questionKey: '5', label: 'คำใบ้ 5' },
  { gameType: 'hint', questionKey: '6', label: 'คำใบ้ 6' },
  { gameType: 'hint', questionKey: '7', label: 'คำใบ้ 7' },
  { gameType: 'hint', questionKey: '8', label: 'คำใบ้ 8' },
]

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
