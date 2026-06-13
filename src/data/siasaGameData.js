export const siasaCategories = [
  {
    id: 'a',
    name: 'A',
    label: 'หมวด A',
    available: true,
    rounds: [
      {
        prompt: 'สถตสมพนธ',
        answer: 'สถิติสัมพันธ์',
        hint: 'รวม 4 ชั้นปี',
      },
      {
        prompt: 'ซกม',
        answer: 'ซิกม่า',
        hint: 'สัญลักษณ์',
      },
      {
        prompt: 'ปรกนภย',
        answer: 'ประกันภัย',
        hint: 'สาขา',
      },
      {
        prompt: 'ควมนจปน',
        answer: 'ความน่าจะเป็น',
        hint: 'สถิติ',
      },
    ],
  },
  {
    id: 'b',
    name: 'B',
    label: 'หมวด B',
    available: true,
    rounds: [],
  },
  {
    id: 'c',
    name: 'C',
    label: 'หมวด C',
    available: true,
    rounds: [],
  },
]

export function getSiasaCategoryById(id) {
  return siasaCategories.find((category) => category.id === id)
}

const THAI_CONSONANT = /[\u0E01-\u0E2E]/
const LEADING_VOWELS = new Set(['\u0E40', '\u0E41', '\u0E42', '\u0E44', '\u0E46'])
const MARK_ABOVE = new Set([
  '\u0E31', // ั
  '\u0E33', // ำ
  '\u0E34', // ิ
  '\u0E35', // ี
  '\u0E36', // ึ
  '\u0E37', // ื
  '\u0E47', // ็
  '\u0E48',
  '\u0E49',
  '\u0E4A',
  '\u0E4B', // tone marks
  '\u0E4C', // ์
  '\u0E4D', // ํ
])
const MARK_BELOW = new Set([
  '\u0E38', // ุ
  '\u0E39', // ู
])
const MARK_AFTER = new Set([
  '\u0E30', // ะ
  '\u0E32', // า
])

function collectMarks(word, startIndex) {
  const aboveMarks = []
  const belowMarks = []
  const afterMarks = []
  let index = startIndex

  while (index < word.length) {
    const char = word[index]

    if (THAI_CONSONANT.test(char) || LEADING_VOWELS.has(char)) {
      break
    }

    if (MARK_ABOVE.has(char)) {
      aboveMarks.push(char)
    }

    if (MARK_BELOW.has(char)) {
      belowMarks.push(char)
    }

    if (MARK_AFTER.has(char)) {
      afterMarks.push(char)
    }

    index += 1
  }

  return { aboveMarks, belowMarks, afterMarks, nextIndex: index }
}

function collectTrailingConsonants(word, startIndex) {
  const trailing = []
  let index = startIndex

  while (index < word.length) {
    if (LEADING_VOWELS.has(word[index])) {
      break
    }

    if (!THAI_CONSONANT.test(word[index])) {
      break
    }

    const marks = collectMarks(word, index + 1)
    const hasOwnMarks =
      marks.aboveMarks.length > 0 ||
      marks.belowMarks.length > 0 ||
      marks.afterMarks.length > 0

    if (hasOwnMarks) {
      break
    }

    trailing.push(word[index])
    index = marks.nextIndex
  }

  return { trailing, nextIndex: index }
}

export function getExpandedPromptUnits(answer) {
  const units = []
  let index = 0

  while (index < answer.length) {
    const beforeMarks = []

    while (index < answer.length && LEADING_VOWELS.has(answer[index])) {
      beforeMarks.push(answer[index])
      index += 1
    }

    if (index >= answer.length) {
      break
    }

    const char = answer[index]

    if (!THAI_CONSONANT.test(char)) {
      index += 1
      continue
    }

    const consonant = char
    index += 1
    const marks = collectMarks(answer, index)
    index = marks.nextIndex

    const unit = {
      consonant,
      beforeMarks,
      aboveMarks: marks.aboveMarks,
      belowMarks: marks.belowMarks,
      afterMarks: marks.afterMarks,
      trailingConsonants: [],
      before: beforeMarks.length > 0,
      above: marks.aboveMarks.length > 0,
      below: marks.belowMarks.length > 0,
      after: marks.afterMarks.length > 0,
      trail: false,
    }

    if (beforeMarks.length > 0) {
      const trailing = collectTrailingConsonants(answer, index)
      unit.trailingConsonants = trailing.trailing
      unit.trail = trailing.trailing.length > 0
      index = trailing.nextIndex
    }

    units.push(unit)
  }

  return units
}

export function getRevealSequence(units) {
  const sequence = []

  units.forEach((unit, unitIndex) => {
    unit.beforeMarks.forEach((char, markIndex) => {
      sequence.push({ unitIndex, position: 'before', markIndex, char })
    })
    unit.aboveMarks.forEach((char, markIndex) => {
      sequence.push({ unitIndex, position: 'above', markIndex, char })
    })
    unit.belowMarks.forEach((char, markIndex) => {
      sequence.push({ unitIndex, position: 'below', markIndex, char })
    })
    unit.afterMarks.forEach((char, markIndex) => {
      sequence.push({ unitIndex, position: 'after', markIndex, char })
    })
    unit.trailingConsonants.forEach((char, markIndex) => {
      sequence.push({ unitIndex, position: 'trail', markIndex, char })
    })
  })

  return sequence
}

function getSlotSteps(sequence, unitIndex, position) {
  return sequence.filter((step) => step.unitIndex === unitIndex && step.position === position)
}

export function getSlotDisplay(
  unit,
  unitIndex,
  position,
  sequence,
  revealedCount,
  showExpandedSlots,
) {
  const marks =
    position === 'before'
      ? unit.beforeMarks
      : position === 'above'
        ? unit.aboveMarks
        : position === 'below'
          ? unit.belowMarks
          : unit.afterMarks
  if (marks.length === 0) {
    return { visible: false, text: '', isMark: false }
  }

  const steps = getSlotSteps(sequence, unitIndex, position)
  const revealedSteps = steps.filter((step) => step.globalIndex < revealedCount)
  const latestStep = revealedCount > 0 ? sequence[revealedCount - 1] : null
  const animate =
    latestStep?.unitIndex === unitIndex &&
    latestStep?.position === position &&
    revealedSteps.length > 0

  if (revealedSteps.length > 0) {
    return {
      visible: true,
      text: revealedSteps.map((step) => step.char).join(''),
      isMark: true,
      animate,
    }
  }

  if (showExpandedSlots) {
    return { visible: true, text: '_', isMark: false }
  }

  return { visible: false, text: '', isMark: false }
}

function getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, position) {
  return sequence
    .filter(
      (step) =>
        step.unitIndex === unitIndex &&
        step.position === position &&
        step.globalIndex < revealedCount,
    )
    .map((step) => step.char)
    .join('')
}

/** Build partial/full Thai syllable in correct Unicode order for reveal display */
export function getUnitRevealSyllable(unit, unitIndex, sequence, revealedCount) {
  const before = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'before')
  const above = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'above')
  const below = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'below')
  const after = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'after')
  const trail = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'trail')

  return `${before}${unit.consonant}${above}${below}${after}${trail}`
}

export function unitRevealShouldAnimate(unitIndex, sequence, revealedCount) {
  if (revealedCount === 0) {
    return false
  }

  return sequence[revealedCount - 1]?.unitIndex === unitIndex
}

export function buildRevealSequence(units) {
  const sequence = getRevealSequence(units)
  return sequence.map((step, globalIndex) => ({ ...step, globalIndex }))
}

/** @deprecated kept for compatibility */
export function getExpandedPrompt(answer) {
  return getExpandedPromptUnits(answer)
    .map((unit) => {
      let part = ''
      if (unit.above) {
        part += '_'
      }
      if (unit.before) {
        part += '_'
      }
      part += unit.consonant
      if (unit.after) {
        part += '_'
      }
      if (unit.below) {
        part += '_'
      }
      return part
    })
    .join('')
}

export function getRoundHint(round) {
  return round.hint ?? null
}
