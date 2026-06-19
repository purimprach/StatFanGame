export const SPECIAL_PRIZES = {
  firstArrival: {
    id: 'first-arrival',
    buttonLabel: 'รางวัลพิเศษ สำหรับคนที่มางานคนแรก',
    revealLabel: 'รางวัลพิเศษ · มางานคนแรก',
    displayName: null,
    subtitle: 'ผู้มางานคนแรกในงาน STAT#55',
    details: [],
    emptyMessage: 'ยังไม่ได้กรอกชื่อ — ให้แอดมินกรอกที่หน้า /admin-answers',
  },
  firstFormRegistration: {
    id: 'first-form',
    buttonLabel: 'คนที่กรอกฟอร์มมางานคนแรก',
    revealLabel: 'ลงทะเบียนฟอร์มคนแรก',
    displayName: 'นางสาว วรรณกมล สนิทวงศ์ ณ อยุธยา',
    subtitle: '6542105226 · BIT',
    details: [
      { label: 'ประกาศเปิดรับ', value: '9 มิถุนายน 2569 · 18:12 น.' },
      { label: 'ลงทะเบียน', value: '9 มิถุนายน 2569 · 18:14:23 น.' },
    ],
  },
  lastFormRegistration: {
    id: 'last-form',
    buttonLabel: 'คนที่กรอกฟอร์มมางานคนสุดท้าย',
    steps: [
      {
        revealLabel: 'ลงทะเบียนฟอร์มคนสุดท้าย',
        displayName: 'นาย รักษ์พันธ์ มีมาก',
        subtitle: '6542101726 · INS',
        details: [
          { label: 'ลงทะเบียน', value: '11 มิถุนายน 2569 · 0:00:49 น.' },
        ],
        note: 'ไม่ได้รับรางวัล — กรอกหลังเวลาปิดรับ (เกินเวลา)',
        advanceLabel: 'ประมวลผลใหม่',
      },
      {
        revealLabel: 'ลงทะเบียนฟอร์มคนสุดท้าย · ผู้ได้รางวัล',
        displayName: 'นาย ชิษณุพงศ์ เกียรติเพชรรัตน์',
        buildingStatus: 'กำลังประมวลผลใหม่...',
        subtitle: '6542027026 · INS',
        details: [
          { label: 'ลงทะเบียน', value: '10 มิถุนายน 2569 · 22:40:01 น.' },
        ],
        note: 'ผู้กรอกฟอร์มคนสุดท้ายที่อยู่ในเวลาปิดรับ',
        noteVariant: 'success',
      },
    ],
  },
}

function buildEditablePrize(base, setting, timeLabel, timeKey) {
  if (!setting?.displayName) {
    return {
      ...base,
      displayName: base.emptyMessage,
      isEmpty: true,
    }
  }

  const subtitleParts = [setting.studentId, setting.branch].filter(Boolean)
  const timeValue = setting[timeKey]

  return {
    ...base,
    displayName: setting.displayName,
    subtitle: subtitleParts.length > 0 ? subtitleParts.join(' · ') : base.subtitle,
    details: timeValue ? [{ label: timeLabel, value: timeValue }] : [],
    isEmpty: false,
  }
}

export const SPECIAL_PRIZE_LIST = [
  SPECIAL_PRIZES.firstArrival,
  SPECIAL_PRIZES.firstFormRegistration,
  SPECIAL_PRIZES.lastFormRegistration,
]

export function buildFirstArrivalPrize(setting) {
  return buildEditablePrize(SPECIAL_PRIZES.firstArrival, setting, 'เวลามางาน', 'arrivedAt')
}

export function resolvePrizeView(prize, lastFormStep = 0) {
  if (!prize?.steps) {
    return prize
  }

  const step = prize.steps[lastFormStep] ?? prize.steps[0]
  return {
    ...step,
    id: prize.id,
    buttonLabel: prize.buttonLabel,
  }
}
