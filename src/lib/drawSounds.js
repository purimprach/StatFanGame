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

export function playDrawStart() {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(280, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.18)
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.24)
}

export function playDrawTick(progress = 0) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t = ctx.currentTime
  const volume = 0.055 + (1 - progress) * 0.03

  osc.type = 'sine'
  osc.frequency.setValueAtTime(920 - progress * 360, t)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.06)
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
    gain.gain.exponentialRampToValueAtTime(0.13, t + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.58)
  })
}

export const DRAW_TIMING = {
  durationMs: 5200,
  minDelayMs: 38,
  maxDelayMs: 620,
  easePower: 4.8,
}

export function getDrawTickDelay(progress) {
  const clamped = Math.min(Math.max(progress, 0), 1)
  const eased = clamped ** DRAW_TIMING.easePower
  return DRAW_TIMING.minDelayMs + eased * (DRAW_TIMING.maxDelayMs - DRAW_TIMING.minDelayMs)
}
