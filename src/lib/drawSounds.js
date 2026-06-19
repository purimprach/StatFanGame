let audioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) {
    return null
  }

  if (!audioContext) {
    audioContext = new AudioCtx()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }

  return audioContext
}

export const DRAW_TIMING = {
  spinPhaseMs: 4200,
  minDelayMs: 38,
  maxDelayMs: 580,
  easePower: 4.8,
  suspenseDelaysMs: [520, 640, 780, 980],
  revealPauseMs: 420,
}

export function getDrawTickDelay(progress) {
  const clamped = Math.min(Math.max(progress, 0), 1)
  const eased = clamped ** DRAW_TIMING.easePower
  return DRAW_TIMING.minDelayMs + eased * (DRAW_TIMING.maxDelayMs - DRAW_TIMING.minDelayMs)
}

export function playDrawStart() {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t = ctx.currentTime

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(280, t)
  osc.frequency.exponentialRampToValueAtTime(560, t + 0.2)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.26)
}

export function playDrawTick(progress = 0) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t = ctx.currentTime
  const volume = 0.1 + (1 - progress) * 0.05

  osc.type = 'sine'
  osc.frequency.setValueAtTime(940 - progress * 320, t)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.065)
}

export function playDrawSuspenseTick(step = 1) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const clampedStep = Math.min(Math.max(step, 1), 4)
  const t = ctx.currentTime
  const volume = 0.2 + clampedStep * 0.06
  const baseFreq = 720 - clampedStep * 55

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(baseFreq, t)
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, t + 0.12)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.15)

  const knock = ctx.createOscillator()
  const knockGain = ctx.createGain()
  knock.type = 'square'
  knock.frequency.setValueAtTime(180 + clampedStep * 18, t)
  knockGain.gain.setValueAtTime(volume * 0.35, t)
  knockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
  knock.connect(knockGain)
  knockGain.connect(ctx.destination)
  knock.start(t)
  knock.stop(t + 0.09)
}

export function playDrawWin() {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const notes = [523.25, 659.25, 783.99, 1046.5]
  const start = ctx.currentTime

  notes.forEach((frequency, index) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t = start + index * 0.11

    osc.type = 'triangle'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.24, t + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.62)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.65)
  })
}
