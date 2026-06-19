import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import {
  buildRevealSequence,
  getExpandedPromptUnits,
  getRoundHint,
  getSiasaCategoryById,
  getSlotDisplay,
  getRevealedSyllableCore,
  shouldSplitTrailingUnit,
  unitRevealShouldAnimate,
} from '../data/siasaGameData'
import { playRevealEmphasis, playSiasaCountdownTick, playSiasaPhaseChange, startRevealWait, stopRevealWait } from '../lib/gameSounds'
import '../App.css'
import './HintGame.css'
import './SiasaGame.css'

const REVEAL_INTERVAL_MS = 480
const EXPAND_DURATION_MS = 750

const TIMER_PHASES = {
  compact: { duration: 12, label: 'เวลาตอบ' },
  expand: { duration: 10, label: 'ขยายแล้ว — ตอบ!' },
  hint: { duration: 8, label: 'คำใบ้ — ตอบ!' },
}

const initialHelpers = () => ({
  hint: false,
  expand: false,
})

export default function SiasaPlayPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = getSiasaCategoryById(categoryId)
  const [roundIndex, setRoundIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [revealedMarkCount, setRevealedMarkCount] = useState(0)
  const [usedHelpers, setUsedHelpers] = useState(initialHelpers)
  const [expandComplete, setExpandComplete] = useState(false)
  const [promptFitScale, setPromptFitScale] = useState(1)
  const [timerPhase, setTimerPhase] = useState('compact')
  const [secondsLeft, setSecondsLeft] = useState(TIMER_PHASES.compact.duration)
  const promptWrapRef = useRef(null)
  const promptRef = useRef(null)
  const revealEmphasisPlayedRef = useRef(false)

  const currentRound = category?.rounds[roundIndex]
  const isExpandedLayout = usedHelpers.expand || showAnswer
  const expandedUnits = useMemo(
    () => (currentRound ? getExpandedPromptUnits(currentRound.answer) : []),
    [currentRound],
  )
  const revealSequence = useMemo(
    () => buildRevealSequence(expandedUnits),
    [expandedUnits],
  )
  const showExpandedSlots = usedHelpers.expand || showAnswer

  useEffect(() => {
    if (!showAnswer) {
      setRevealedMarkCount(0)
      stopRevealWait()
      revealEmphasisPlayedRef.current = false
      return undefined
    }

    if (revealSequence.length === 0) {
      return undefined
    }

    startRevealWait()
    setRevealedMarkCount(0)
    let count = 0

    const timer = window.setInterval(() => {
      count += 1
      setRevealedMarkCount(count)

      if (count >= revealSequence.length) {
        window.clearInterval(timer)
      }
    }, REVEAL_INTERVAL_MS)

    return () => {
      window.clearInterval(timer)
      stopRevealWait()
    }
  }, [showAnswer, roundIndex, revealSequence.length])

  useEffect(() => {
    if (!showAnswer || revealSequence.length === 0) {
      return
    }

    if (revealedMarkCount >= revealSequence.length && !revealEmphasisPlayedRef.current) {
      revealEmphasisPlayedRef.current = true
      stopRevealWait()
      playRevealEmphasis()
    }
  }, [showAnswer, revealedMarkCount, revealSequence.length])

  useEffect(() => {
    if (showAnswer) {
      return undefined
    }

    let cancelled = false
    let phase = 'compact'
    let remaining = TIMER_PHASES.compact.duration

    setTimerPhase('compact')
    setSecondsLeft(remaining)
    setUsedHelpers(initialHelpers())
    setExpandComplete(false)
    playSiasaPhaseChange('compact')

    const id = window.setInterval(() => {
      if (cancelled) {
        return
      }

      remaining -= 1
      setSecondsLeft(remaining)

      if (remaining > 0) {
        playSiasaCountdownTick(phase, remaining, TIMER_PHASES[phase].duration)
        return
      }

      if (phase === 'compact') {
        phase = 'expand'
        remaining = TIMER_PHASES.expand.duration
        setTimerPhase('expand')
        setSecondsLeft(remaining)
        setUsedHelpers((prev) => ({ ...prev, expand: true }))
        playSiasaPhaseChange('expand')
        playSiasaCountdownTick('expand', remaining, TIMER_PHASES.expand.duration)
        return
      }

      if (phase === 'expand') {
        phase = 'hint'
        remaining = TIMER_PHASES.hint.duration
        setTimerPhase('hint')
        setSecondsLeft(remaining)
        setUsedHelpers((prev) => ({ ...prev, hint: true }))
        playSiasaPhaseChange('hint')
        playSiasaCountdownTick('hint', remaining, TIMER_PHASES.hint.duration)
        return
      }

      if (phase === 'hint') {
        setShowAnswer(true)
        setTimerPhase('revealed')
        window.clearInterval(id)
      }
    }, 1000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [roundIndex, showAnswer])

  useEffect(() => {
    if (!usedHelpers.expand || showAnswer) {
      if (!usedHelpers.expand) {
        setExpandComplete(false)
      }
      return undefined
    }

    setExpandComplete(false)
    const timer = window.setTimeout(() => setExpandComplete(true), EXPAND_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [usedHelpers.expand, showAnswer, roundIndex])

  useLayoutEffect(() => {
    const wrap = promptWrapRef.current
    const prompt = promptRef.current

    if (!isExpandedLayout || !wrap || !prompt) {
      setPromptFitScale(1)
      return undefined
    }

    const measure = () => {
      prompt.style.setProperty('--siasa-fit-scale', '1')
      const savedGap = prompt.style.gap
      prompt.style.gap = '0.02em 0.04em'

      const available = wrap.clientWidth
      const needed = prompt.scrollWidth
      const scale =
        needed > available && available > 0 ? Math.max(0.42, available / needed) : 1

      prompt.style.gap = savedGap
      setPromptFitScale(scale)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(wrap)

    return () => observer.disconnect()
  }, [
    isExpandedLayout,
    roundIndex,
    expandedUnits.length,
    expandComplete,
    usedHelpers.expand,
    showAnswer,
  ])

  if (!category) {
    return (
      <div className="landing">
        <PageBackground />
        <main className="landing__content hint-page">
          <p className="hint-page__subtitle">ไม่พบหมวดนี้</p>
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/siasa')}
          >
            กลับไปเลือกหมวด
          </button>
        </main>
      </div>
    )
  }

  if (category.rounds.length === 0) {
    return (
      <div className="landing landing--scroll">
        <PageBackground />
        <main className="landing__content hint-page">
          <header className="hint-page__header">
            <button
              type="button"
              className="hint-btn hint-btn--ghost"
              onClick={() => navigate('/siasa')}
            >
              ← กลับไปเลือกหมวด
            </button>
            <h1 className="hint-page__title">{category.label}</h1>
          </header>
          <section className="siasa-placeholder">
            <span className="siasa-placeholder__icon" aria-hidden="true">
              🎭
            </span>
            <p className="siasa-placeholder__text">กำลังเตรียมเนื้อหาเกม</p>
          </section>
        </main>
      </div>
    )
  }

  const isLastRound = roundIndex >= category.rounds.length - 1
  const isFirstRound = roundIndex === 0
  const roundHint = getRoundHint(currentRound)

  const resetRound = () => {
    setShowAnswer(false)
    setRevealedMarkCount(0)
    setExpandComplete(false)
    setUsedHelpers(initialHelpers())
    setTimerPhase('compact')
    setSecondsLeft(TIMER_PHASES.compact.duration)
  }

  const handleSkip = () => {
    if (isLastRound) {
      navigate('/siasa')
      return
    }
    setRoundIndex((prev) => prev + 1)
    resetRound()
  }

  const handleBack = () => {
    if (isFirstRound) {
      return
    }
    setRoundIndex((prev) => prev - 1)
    resetRound()
  }

  const timerLabel = TIMER_PHASES[timerPhase]?.label ?? 'เฉลยแล้ว'
  const timerUrgent = !showAnswer && secondsLeft <= 3

  const renderSlot = (unit, unitIndex, position) => {
    const slot = getSlotDisplay(
      unit,
      unitIndex,
      position,
      revealSequence,
      revealedMarkCount,
      showExpandedSlots,
    )

    let displayText = slot.text
    if (slot.isMark) {
      displayText =
        position === 'before'
          ? `${slot.text}${unit.consonant}`
          : `${unit.consonant}${slot.text}`
    }

    const animateClass = slot.animate ? ' siasa-char-unit__glyph--animate' : ''

    return (
      <span
        className={`siasa-char-unit__slot siasa-char-unit__slot--${position} ${
          slot.visible ? 'siasa-char-unit__slot--filled' : ''
        } ${slot.isMark ? 'siasa-char-unit__slot--mark' : ''}`}
        aria-hidden={!slot.visible}
      >
        {position === 'after' && slot.isMark ? (
          <span className={`siasa-char-unit__after-glyph${animateClass}`}>{displayText}</span>
        ) : slot.isMark && (position === 'above' || position === 'below') ? (
          <span className={`siasa-char-unit__mark-glyph${animateClass}`}>{displayText}</span>
        ) : (
          displayText
        )}
      </span>
    )
  }

  const renderExpandedUnit = (unit, index) => {
    const splitTrailing = shouldSplitTrailingUnit(unit)
    const revealedCore = showAnswer
      ? getRevealedSyllableCore(unit, index, revealSequence, revealedMarkCount)
      : null
    const trailingInCore =
      splitTrailing &&
      revealedCore &&
      revealedCore.endsWith(unit.trailingConsonants.join(''))
    const coreAnimate =
      showAnswer && unitRevealShouldAnimate(index, revealSequence, revealedMarkCount)

    if (revealedCore) {
      return (
        <Fragment key={index}>
          <span className="siasa-char-unit">
            <span className="siasa-char-unit__body">
              <span
                className={`siasa-char-unit__syllable${
                  coreAnimate ? ' siasa-char-unit__glyph--animate' : ''
                }`}
              >
                {revealedCore}
              </span>
            </span>
          </span>
          {splitTrailing &&
            !trailingInCore &&
            unit.trailingConsonants.map((char, trailIndex) => (
              <span key={`${index}-trail-${trailIndex}`} className="siasa-char-unit">
                <span className="siasa-char-unit__body">
                  <span className="siasa-char-unit__cons">{char}</span>
                </span>
              </span>
            ))}
        </Fragment>
      )
    }

    const charUnit = (
      <span className="siasa-char-unit">
        {renderSlot(unit, index, 'above')}
        <span className="siasa-char-unit__body">
          {renderSlot(unit, index, 'before')}
          <span className="siasa-char-unit__cons-stack">
            <span className="siasa-char-unit__cons">{unit.consonant}</span>
            {renderSlot(unit, index, 'below')}
          </span>
          {renderSlot(unit, index, 'after')}
          {!splitTrailing &&
            unit.trailingConsonants?.map((char, trailIndex) => (
              <span key={trailIndex} className="siasa-char-unit__cons">
                {char}
              </span>
            ))}
        </span>
      </span>
    )

    return (
      <Fragment key={index}>
        {charUnit}
        {splitTrailing &&
          unit.trailingConsonants.map((char, trailIndex) => (
            <span key={`${index}-trail-${trailIndex}`} className="siasa-char-unit">
              <span className="siasa-char-unit__body">
                <span className="siasa-char-unit__cons">{char}</span>
              </span>
            </span>
          ))}
      </Fragment>
    )
  }

  return (
    <div className="landing landing--siasa-play">
      <PageBackground />

      <main className="landing__content hint-page hint-page--play hint-page--siasa">
        <div className="hint-play-toolbar">
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/siasa')}
          >
            ← กลับไปเลือกหมวด
          </button>
        </div>

        <div className="siasa-play-stage">
          <header className="siasa-round-header" aria-label={`รอบที่ ${roundIndex + 1}`}>
            <div className="siasa-round-header__pill" key={roundIndex}>
              <span className="siasa-round-header__label">ROUND</span>
              <span className="siasa-round-header__divider" aria-hidden="true" />
              <span className="siasa-round-header__value">
                {String(roundIndex + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="siasa-round-header__meta">
              <span>{category.label}</span>
              <span className="siasa-round-header__dot" aria-hidden="true">
                ·
              </span>
              <span>
                {roundIndex + 1} / {category.rounds.length}
              </span>
            </p>
          </header>

          <div className={`siasa-panel ${showAnswer ? 'siasa-panel--revealed' : ''}`}>
            <div className="siasa-panel__side siasa-panel__side--left" aria-hidden="true" />
            <div className="siasa-panel__inner">
              <div className="siasa-prompt-wrap" key={roundIndex} ref={promptWrapRef}>
                <p
                  ref={promptRef}
                  className={`siasa-prompt ${
                    isExpandedLayout ? 'siasa-prompt--expanded' : 'siasa-prompt--compact'
                  } ${showAnswer ? 'siasa-prompt--revealing' : ''} ${
                    usedHelpers.expand && !expandComplete && !showAnswer
                      ? 'siasa-prompt--expanding'
                      : ''
                  }`}
                  style={
                    isExpandedLayout
                      ? { '--siasa-fit-scale': promptFitScale }
                      : undefined
                  }
                  role="status"
                  aria-live="polite"
                >
                  {isExpandedLayout ? (
                    expandedUnits.map((unit, index) => renderExpandedUnit(unit, index))
                  ) : (
                    [...currentRound.prompt].map((char, index) => (
                      <span key={index} className="siasa-compact-char">
                        {char}
                      </span>
                    ))
                  )}
                </p>
              </div>
            </div>
            <div className="siasa-panel__side siasa-panel__side--right" aria-hidden="true" />
          </div>

          {!showAnswer && (
            <div
              className={`siasa-timer siasa-timer--phase-${timerPhase} ${
                timerUrgent ? 'siasa-timer--urgent' : ''
              }`}
              role="timer"
              aria-live="polite"
            >
              <p className="siasa-timer__label">{timerLabel}</p>
              <p className="siasa-timer__seconds">{secondsLeft}</p>
              <p className="siasa-timer__meta">
                {timerPhase === 'compact' && '12 วินาทีแรก'}
                {timerPhase === 'expand' && 'หลังขยายตัวอักษร'}
                {timerPhase === 'hint' && 'หลังเปิดคำใบ้'}
              </p>
            </div>
          )}

          {usedHelpers.hint && roundHint && !showAnswer && (
            <p className="siasa-hint-banner" role="status" aria-live="polite">
              <span className="siasa-hint-banner__label">คำใบ้</span>
              <span className="siasa-hint-banner__text">{roundHint}</span>
            </p>
          )}

          <div className="siasa-actions">
            <button
              type="button"
              className="hint-btn hint-btn--ghost siasa-actions__btn"
              onClick={handleBack}
              disabled={isFirstRound}
            >
              ย้อนกลับ
            </button>
            {showAnswer ? (
              <button
                type="button"
                className="hint-btn hint-btn--gold siasa-actions__btn"
                onClick={handleSkip}
              >
                {isLastRound ? 'จบหมวด' : 'คำถัดไป'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="hint-btn hint-btn--ghost siasa-actions__btn"
                  onClick={() => setShowAnswer(true)}
                >
                  เฉลยทันที
                </button>
                <button
                  type="button"
                  className="hint-btn hint-btn--ghost siasa-actions__btn"
                  onClick={handleSkip}
                >
                  {isLastRound ? 'จบหมวด' : 'ข้าม'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
