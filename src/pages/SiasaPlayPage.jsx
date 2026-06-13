import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import {
  buildRevealSequence,
  getExpandedPromptUnits,
  getRoundHint,
  getSiasaCategoryById,
  getSlotDisplay,
  getUnitRevealSyllable,
  unitRevealShouldAnimate,
} from '../data/siasaGameData'
import '../App.css'
import './HintGame.css'
import './SiasaGame.css'

const REVEAL_INTERVAL_MS = 480

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

  const currentRound = category?.rounds[roundIndex]
  const expandedUnits = useMemo(
    () => (currentRound ? getExpandedPromptUnits(currentRound.answer) : []),
    [currentRound],
  )
  const revealSequence = useMemo(
    () => buildRevealSequence(expandedUnits),
    [expandedUnits],
  )

  useEffect(() => {
    if (!showAnswer) {
      setRevealedMarkCount(0)
      return undefined
    }

    if (revealSequence.length === 0) {
      return undefined
    }

    setRevealedMarkCount(0)
    let count = 0

    const timer = window.setInterval(() => {
      count += 1
      setRevealedMarkCount(count)

      if (count >= revealSequence.length) {
        window.clearInterval(timer)
      }
    }, REVEAL_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [showAnswer, roundIndex, revealSequence.length])

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
  const isExpandedLayout = usedHelpers.expand || showAnswer
  const showExpandedSlots = usedHelpers.expand || showAnswer

  const resetRound = () => {
    setShowAnswer(false)
    setRevealedMarkCount(0)
    setUsedHelpers(initialHelpers())
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

  const useHelper = (id) => {
    if (showAnswer || usedHelpers[id]) {
      return
    }
    setUsedHelpers((prev) => ({ ...prev, [id]: true }))
  }

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
      displayText = `${unit.consonant}${slot.text}`
    }

    return (
      <span
        className={`siasa-char-unit__slot siasa-char-unit__slot--${position} ${
          slot.visible ? 'siasa-char-unit__slot--filled' : ''
        } ${slot.isMark ? 'siasa-char-unit__slot--mark' : ''} ${
          slot.animate ? 'siasa-char-unit__slot--animate' : ''
        }`}
        aria-hidden={!slot.visible}
      >
        {displayText}
      </span>
    )
  }

  const renderExpandedUnit = (unit, index) => {
    if (showAnswer) {
      const syllable = getUnitRevealSyllable(unit, index, revealSequence, revealedMarkCount)
      const animate = unitRevealShouldAnimate(index, revealSequence, revealedMarkCount)

      return (
        <span key={index} className="siasa-char-unit siasa-char-unit--syllable">
          <span
            className={`siasa-char-unit__syllable ${
              animate ? 'siasa-char-unit__syllable--animate' : ''
            }`}
          >
            {syllable}
          </span>
        </span>
      )
    }

    return (
      <span key={index} className="siasa-char-unit">
        {renderSlot(unit, index, 'above')}
        <span className="siasa-char-unit__body">
          {renderSlot(unit, index, 'before')}
          <span className="siasa-char-unit__cons">{unit.consonant}</span>
          {renderSlot(unit, index, 'after')}
          {unit.trailingConsonants?.map((char, trailIndex) => (
            <span key={trailIndex} className="siasa-char-unit__cons">
              {char}
            </span>
          ))}
        </span>
        {renderSlot(unit, index, 'below')}
      </span>
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
              <div className="siasa-prompt-wrap" key={roundIndex}>
                <p
                  className={`siasa-prompt ${
                    isExpandedLayout ? 'siasa-prompt--expanded' : 'siasa-prompt--compact'
                  } ${showAnswer ? 'siasa-prompt--revealing' : ''}`}
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

          <div className="siasa-helpers">
            <button
              type="button"
              className={`siasa-helper-btn siasa-helper-btn--expand ${
                usedHelpers.expand ? 'siasa-helper-btn--used' : ''
              }`}
              onClick={() => useHelper('expand')}
              disabled={showAnswer || usedHelpers.expand}
            >
              ↔ ขยาย
            </button>
            <button
              type="button"
              className={`siasa-helper-btn siasa-helper-btn--hint ${
                usedHelpers.hint ? 'siasa-helper-btn--used' : ''
              }`}
              onClick={() => useHelper('hint')}
              disabled={showAnswer || usedHelpers.hint || !roundHint}
            >
              💡 คำใบ้
            </button>
          </div>

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
            <button
              type="button"
              className="hint-btn hint-btn--gold siasa-actions__btn"
              onClick={() => setShowAnswer(true)}
              disabled={showAnswer}
            >
              เฉลย
            </button>
            <button
              type="button"
              className="hint-btn hint-btn--ghost siasa-actions__btn"
              onClick={handleSkip}
            >
              {isLastRound ? 'จบหมวด' : 'ข้าม'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
