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

export function playUiClick() {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const t = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(920, t)
  osc.frequency.exponentialRampToValueAtTime(680, t + 0.045)
  gain.gain.setValueAtTime(0.11, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.075)

  const click = ctx.createOscillator()
  const clickGain = ctx.createGain()
  click.type = 'square'
  click.frequency.setValueAtTime(180, t)
  clickGain.gain.setValueAtTime(0.035, t)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025)
  click.connect(clickGain)
  clickGain.connect(ctx.destination)
  click.start(t)
  click.stop(t + 0.03)
}

export function playPuzzleTileFlip(isOpening = true) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const t = ctx.currentTime

  if (isOpening) {
    const swoosh = ctx.createOscillator()
    const swooshGain = ctx.createGain()
    swoosh.type = 'sine'
    swoosh.frequency.setValueAtTime(280, t)
    swoosh.frequency.exponentialRampToValueAtTime(820, t + 0.09)
    swooshGain.gain.setValueAtTime(0.0001, t)
    swooshGain.gain.exponentialRampToValueAtTime(0.1, t + 0.025)
    swooshGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11)
    swoosh.connect(swooshGain)
    swooshGain.connect(ctx.destination)
    swoosh.start(t)
    swoosh.stop(t + 0.12)

    const chime = ctx.createOscillator()
    const chimeGain = ctx.createGain()
    chime.type = 'triangle'
    chime.frequency.setValueAtTime(1046.5, t + 0.045)
    chimeGain.gain.setValueAtTime(0.0001, t + 0.045)
    chimeGain.gain.exponentialRampToValueAtTime(0.08, t + 0.055)
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
    chime.connect(chimeGain)
    chimeGain.connect(ctx.destination)
    chime.start(t + 0.045)
    chime.stop(t + 0.11)
    return
  }

  const close = ctx.createOscillator()
  const closeGain = ctx.createGain()
  close.type = 'sine'
  close.frequency.setValueAtTime(620, t)
  close.frequency.exponentialRampToValueAtTime(340, t + 0.08)
  closeGain.gain.setValueAtTime(0.07, t)
  closeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  close.connect(closeGain)
  closeGain.connect(ctx.destination)
  close.start(t)
  close.stop(t + 0.1)
}

export function playHintReveal(isOpening = true) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const t = ctx.currentTime

  if (isOpening) {
    const glow = ctx.createOscillator()
    const glowGain = ctx.createGain()
    glow.type = 'sine'
    glow.frequency.setValueAtTime(440, t)
    glow.frequency.exponentialRampToValueAtTime(988, t + 0.12)
    glowGain.gain.setValueAtTime(0.0001, t)
    glowGain.gain.exponentialRampToValueAtTime(0.09, t + 0.03)
    glowGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
    glow.connect(glowGain)
    glowGain.connect(ctx.destination)
    glow.start(t)
    glow.stop(t + 0.15)

    const sparkle = ctx.createOscillator()
    const sparkleGain = ctx.createGain()
    sparkle.type = 'triangle'
    sparkle.frequency.setValueAtTime(1318.5, t + 0.05)
    sparkleGain.gain.setValueAtTime(0.0001, t + 0.05)
    sparkleGain.gain.exponentialRampToValueAtTime(0.075, t + 0.06)
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13)
    sparkle.connect(sparkleGain)
    sparkleGain.connect(ctx.destination)
    sparkle.start(t + 0.05)
    sparkle.stop(t + 0.14)
    return
  }

  const hide = ctx.createOscillator()
  const hideGain = ctx.createGain()
  hide.type = 'sine'
  hide.frequency.setValueAtTime(740, t)
  hide.frequency.exponentialRampToValueAtTime(420, t + 0.07)
  hideGain.gain.setValueAtTime(0.055, t)
  hideGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
  hide.connect(hideGain)
  hideGain.connect(ctx.destination)
  hide.start(t)
  hide.stop(t + 0.09)
}

const SIASA_PHASE_BASE_FREQ = {
  compact: 520,
  expand: 660,
  hint: 820,
}

export function playSiasaPhaseChange(phase) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const base = SIASA_PHASE_BASE_FREQ[phase] ?? 560
  const t = ctx.currentTime

  const lead = ctx.createOscillator()
  const leadGain = ctx.createGain()
  lead.type = 'triangle'
  lead.frequency.setValueAtTime(base * 0.85, t)
  lead.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.16)
  leadGain.gain.setValueAtTime(0.0001, t)
  leadGain.gain.exponentialRampToValueAtTime(0.1, t + 0.04)
  leadGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
  lead.connect(leadGain)
  leadGain.connect(ctx.destination)
  lead.start(t)
  lead.stop(t + 0.22)
}

export function playSiasaCountdownTick(phase, secondsLeft, phaseDuration) {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  const base = SIASA_PHASE_BASE_FREQ[phase] ?? 560
  const urgent = secondsLeft <= 3
  const t = ctx.currentTime
  const volume = urgent ? 0.12 : 0.075
  const freq = base + (phaseDuration - secondsLeft) * 8 + (urgent ? 120 : 0)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = urgent ? 'triangle' : 'sine'
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (urgent ? 0.11 : 0.08))
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + (urgent ? 0.12 : 0.09))

  if (urgent) {
    const pulse = ctx.createOscillator()
    const pulseGain = ctx.createGain()
    pulse.type = 'square'
    pulse.frequency.setValueAtTime(160, t)
    pulseGain.gain.setValueAtTime(0.025, t)
    pulseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
    pulse.connect(pulseGain)
    pulseGain.connect(ctx.destination)
    pulse.start(t)
    pulse.stop(t + 0.07)
  }
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
