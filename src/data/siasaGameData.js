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
      {
        prompt: 'คยบญช',
        answer: 'ค่ายบัญชี',
        hint: 'ไปต่างจังหวัด',
      },
      {
        prompt: 'หวหนภค',
        answer: 'หัวหน้าภาค',
        hint: 'จันทร์เจ้า',
      },
      {
        prompt: 'บณฑต กนตบตร',
        answer: 'บัณฑิต กันตะบุตร',
        hint: 'ก่อตั้ง',
      },
      {
        prompt: 'กรงบสบญช',
        answer: 'กรงบาสบัญชี',
        hint: 'ทางผ่านไปจามจุรีสแควร์',
      },
      {
        prompt: 'ตหนงวชกร',
        answer: 'ตำแหน่งวิชาการ',
        hint: 'รองศาสตราจารย์',
      },
      {
        prompt: 'บรชย ภทรกศล',
        answer: 'บุรัชย์ ภัทรโกศล',
        hint: 'อาจารย์',
      },
    ],
  },
  {
    id: 'b',
    name: 'B',
    label: 'หมวด B',
    available: true,
    rounds: [
      {
        prompt: 'พนธทย',
        answer: 'พันธุ์ไทย',
        hint: 'CBS Lounge',
      },
      {
        prompt: 'สวตร บญพชรนนท',
        answer: 'สาวิตรี บุญพัชรนนท์',
        hint: 'อาจารย์',
      },
      {
        prompt: 'หองทบยน',
        answer: 'ห้องทะเบียน',
        hint: 'ตึกไชยยศสมบัติ',
      },
      {
        prompt: 'ชนมขมก',
        answer: 'ชานมไข่มุก',
        hint: 'เครื่องดื่ม',
      },
      {
        prompt: 'วทยนพนธ',
        answer: 'วิทยานิพนธ์',
        hint: 'เอกสารทางวิชาการ',
      },
      {
        prompt: 'ชยยศสมบต',
        answer: 'ไชยยศสมบัติ',
        hint: 'อาคาร',
      },
      {
        prompt: 'สรสนทศวทศน',
        answer: 'สารสนเทศวิทัศน์',
        hint: 'วิชา',
      },
      {
        prompt: 'ปณฑวก นค',
        answer: 'ปุณฑวิกา นาคา',
        hint: 'อาจารย์',
      },
      {
        prompt: 'รหสนสต',
        answer: 'รหัสนิสิต',
        hint: 'ตัวเลข 10 หลัก',
      },
      {
        prompt: 'กวยตยวซม',
        answer: 'ก๋วยเตี๋ยวซุ้ม',
        hint: 'ร้านอาหาร',
      },
    ],
  },
  {
    id: 'c',
    name: 'C',
    label: 'หมวด C',
    available: true,
    rounds: [
      {
        prompt: 'สมตกยง',
        answer: 'ส้มตำไก่ย่าง',
        hint: 'อาหาร',
      },
      {
        prompt: 'ศสตรจรย',
        answer: 'ศาสตราจารย์',
        hint: 'ตำแหน่งวิชาการ',
      },
      {
        prompt: 'รงอหรมหต',
        answer: 'โรงอาหารมหิต',
        hint: 'อาหาร',
      },
      {
        prompt: 'ธต อสถกล',
        answer: 'ธิติ โอสถากุล',
        hint: 'อาจารย์',
      },
      {
        prompt: 'สตรบคส',
        answer: 'สตาร์บัคส์',
        hint: 'กาแฟ',
      },
      {
        prompt: 'กรรยนรของครอง',
        answer: 'การเรียนรู้ของเครื่อง',
        hint: 'วิชาเรียน',
      },
      {
        prompt: 'จมจรสควร',
        answer: 'จามจุรีสแควร์',
        hint: 'ห้าง',
      },
      {
        prompt: 'วฐร พงพพงศ',
        answer: 'วิฐรา พึ่งพาพงศ์',
        hint: 'อาจารย์',
      },
      {
        prompt: 'อมรกน',
        answer: 'อเมริกาโน่',
        hint: 'เครื่องดื่ม',
      },
      {
        prompt: 'ทคนลยสรสนทศ',
        answer: 'เทคโนโลยีสารสนเทศ',
        hint: 'สาขา',
      },
    ],
  },
]

export const SIASA_DEMO_CATEGORY = {
  id: 'example',
  name: '★',
  label: 'ตัวอย่าง',
  available: true,
  isDemo: true,
  rounds: [
    {
      prompt: 'งนบยนยร',
      answer: 'งานบายเนียร์',
      hint: 'สำหรับบัณฑิตจบใหม่',
    },
  ],
}

export function getSiasaCategoryById(id) {
  if (id === SIASA_DEMO_CATEGORY.id) {
    return SIASA_DEMO_CATEGORY
  }

  return siasaCategories.find((category) => category.id === id)
}

const THAI_CONSONANT = /[\u0E01-\u0E2E]/
const LEADING_VOWELS = new Set([
  '\u0E40', // เ
  '\u0E41', // แ
  '\u0E42', // โ
  '\u0E43', // ใ
  '\u0E44', // ไ
])
const SARA_AM = '\u0E33' // ำ (sara am = nikahit + aa)
const NIKAHIT = '\u0E4D' // ํ
const SARA_AA = '\u0E32' // า

const MARK_ABOVE = new Set([
  '\u0E31', // ั
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

    if (char === SARA_AM) {
      aboveMarks.push(NIKAHIT)
      afterMarks.push(SARA_AA)
    } else if (MARK_ABOVE.has(char)) {
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
  showExpandedSlots = false,
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
    latestStep?.globalIndex === revealedCount - 1 &&
    latestStep?.unitIndex === unitIndex &&
    latestStep?.position === position

  if (revealedSteps.length > 0) {
    return {
      visible: true,
      text: revealedSteps.map((step) => step.char).join(''),
      isMark: true,
      animate,
    }
  }

  if (showExpandedSlots) {
    return { visible: true, text: '_', isMark: false, animate: false }
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

  return `${before}${unit.consonant}${below}${above}${after}${unit.trailingConsonants.join('')}`
}

function unitMarksFullyRevealed(unit, unitIndex, sequence, revealedCount) {
  const positions = [
    ['before', unit.beforeMarks],
    ['above', unit.aboveMarks],
    ['below', unit.belowMarks],
    ['after', unit.afterMarks],
  ]

  return positions.every(([position, marks]) => {
    if (marks.length === 0) {
      return true
    }

    return (
      getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, position).length >=
      marks.length
    )
  })
}

/** Partial syllable with revealed marks in correct Thai Unicode order */
export function getRevealedSyllableCore(unit, unitIndex, sequence, revealedCount) {
  const before = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'before')
  const above = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'above')
  const below = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'below')
  const after = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'after')

  if (!before && !above && !below && !after) {
    return null
  }

  const trail =
    unit.beforeMarks.length > 0 &&
    unit.trailingConsonants.length > 0 &&
    unitMarksFullyRevealed(unit, unitIndex, sequence, revealedCount)
      ? unit.trailingConsonants.join('')
      : ''

  return formatRevealedSyllableCore(unit.consonant, before, above, below, after, trail)
}

function formatRevealedSyllableCore(consonant, before, above, below, after, trail = '') {
  if (above.includes(NIKAHIT) && after.includes(SARA_AA)) {
    return `${before}${consonant}${SARA_AM}${above.replace(NIKAHIT, '')}${below}${after.replace(SARA_AA, '')}${trail}`
  }

  return `${before}${consonant}${below}${above}${after}${trail}`
}

export function shouldSplitTrailingUnit(unit) {
  return unit.before && unit.trailingConsonants.length > 0
}

export function getRevealedBeforeText(unit, unitIndex, sequence, revealedCount) {
  const before = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'before')
  if (!before) {
    return null
  }
  return `${before}${unit.consonant}`
}

export function getRevealedBelowText(unit, unitIndex, sequence, revealedCount) {
  const below = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'below')
  if (!below) {
    return null
  }
  return `${unit.consonant}${below}`
}

export function getRevealedAboveText(unit, unitIndex, sequence, revealedCount) {
  const above = getRevealedMarkChars(unit, unitIndex, sequence, revealedCount, 'above')
  if (!above) {
    return null
  }

  return `${unit.consonant}${above}`
}

export function unitRevealShouldAnimate(unitIndex, sequence, revealedCount, position) {
  if (revealedCount === 0) {
    return false
  }

  return sequence[revealedCount - 1]?.unitIndex === unitIndex &&
    (!position || sequence[revealedCount - 1]?.position === position)
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
