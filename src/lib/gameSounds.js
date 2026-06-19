let audioContext = null
let revealWaitTimer = null

export function getAudioContext() {
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

function playRevealWaitPulse(tick = 0) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const t = ctx.currentTime
  const progress = Math.min(tick / 10, 1)
  const volume = 0.07 + progress * 0.05

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(520 + progress * 180, t)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.1)
}

export function startRevealWait() {
  stopRevealWait()

  let tick = 0
  const pulse = () => {
    playRevealWaitPulse(tick)
    tick += 1
    const delay = Math.max(170, 420 - tick * 22)
    revealWaitTimer = window.setTimeout(pulse, delay)
  }

  pulse()
}

export function stopRevealWait() {
  if (revealWaitTimer) {
    window.clearTimeout(revealWaitTimer)
    revealWaitTimer = null
  }
}

export function playRevealEmphasis() {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const start = ctx.currentTime

  const hit = ctx.createOscillator()
  const hitGain = ctx.createGain()
  hit.type = 'triangle'
  hit.frequency.setValueAtTime(220, start)
  hit.frequency.exponentialRampToValueAtTime(110, start + 0.12)
  hitGain.gain.setValueAtTime(0.22, start)
  hitGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
  hit.connect(hitGain)
  hitGain.connect(ctx.destination)
  hit.start(start)
  hit.stop(start + 0.18)

  const notes = [523.25, 659.25, 783.99, 987.77]
  notes.forEach((frequency, index) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t = start + 0.08 + index * 0.1

    osc.type = 'triangle'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.045)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.58)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.62)
  })
}
