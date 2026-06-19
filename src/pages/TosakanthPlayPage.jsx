import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import {
  getRandomFriendPrompt,
  getRoundClue,
  getTosakanthCategoryById,
  LIFELINES,
} from '../data/tosakanthGameData'
import { playRevealEmphasis } from '../lib/gameSounds'
import '../App.css'
import './HintGame.css'
import './TosakanthGame.css'

const OPEN_MORE_REDUCTION = 8
const MIN_COVER_PERCENT = 40

const initialLifelines = () => ({
  friend: false,
  clue: false,
  open: false,
})

export default function TosakanthPlayPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = getTosakanthCategoryById(categoryId)
  const [roundIndex, setRoundIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [usedLifelines, setUsedLifelines] = useState(initialLifelines)
  const [openMoreReduction, setOpenMoreReduction] = useState(0)
  const [lifelineMessage, setLifelineMessage] = useState(null)

  if (!category) {
    return (
      <div className="landing">
        <PageBackground />
        <main className="landing__content hint-page">
          <p className="hint-page__subtitle">ไม่พบหมวดนี้</p>
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/tosakanth')}
          >
            กลับไปเลือกหมวด
          </button>
        </main>
      </div>
    )
  }

  const currentRound = category.rounds[roundIndex]
  const isLastRound = roundIndex >= category.rounds.length - 1
  const hideSide = currentRound.hideSide === 'left' ? 'left' : 'right'
  const baseCoverPercent = currentRound.coverPercent ?? 50
  const isLeftCover = hideSide === 'left'
  const minCoverPercent =
    openMoreReduction > 0
      ? (currentRound.minCoverPercent ?? 30)
      : MIN_COVER_PERCENT
  const effectiveCoverPercent = showAnswer
    ? 0
    : Math.max(minCoverPercent, baseCoverPercent - openMoreReduction)
  const coverStyle = { width: `${effectiveCoverPercent}%` }
  const dividerStyle = {
    left: isLeftCover ? `${effectiveCoverPercent}%` : `${100 - effectiveCoverPercent}%`,
  }
  const hintStyle = {
    left: isLeftCover
      ? `${effectiveCoverPercent / 2}%`
      : `${100 - effectiveCoverPercent / 2}%`,
  }

  const resetRoundState = () => {
    setShowAnswer(false)
    setOpenMoreReduction(0)
    setLifelineMessage(null)
  }

  const handleReveal = () => {
    setShowAnswer(true)
    setLifelineMessage(null)
    playRevealEmphasis()
  }

  const handleSkip = () => {
    if (isLastRound) {
      navigate('/tosakanth')
      return
    }

    setRoundIndex((prev) => prev + 1)
    resetRoundState()
  }

  const handleBack = () => {
    if (roundIndex === 0) {
      return
    }

    setRoundIndex((prev) => prev - 1)
    resetRoundState()
  }

  const isFirstRound = roundIndex === 0

  const useLifeline = (id) => {
    if (showAnswer || usedLifelines[id]) {
      return
    }

    setUsedLifelines((prev) => ({ ...prev, [id]: true }))

    if (id === 'friend') {
      setLifelineMessage({
        type: 'friend',
        title: 'ถามเพื่อน',
        text: getRandomFriendPrompt(),
      })
      return
    }

    if (id === 'clue') {
      setLifelineMessage({
        type: 'clue',
        title: 'คำใบ้',
        text: getRoundClue(currentRound),
      })
      return
    }

    setOpenMoreReduction(currentRound.openMorePercent ?? OPEN_MORE_REDUCTION)
  }

  return (
    <div className="landing landing--tosa-play">
      <PageBackground />

      <main className="landing__content hint-page hint-page--play hint-page--tosa">
        <div className="hint-play-toolbar">
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/tosakanth')}
          >
            ← กลับไปเลือกหมวด
          </button>
        </div>

        <div className="tosa-stage">
          <div className="tosa-play-row">
            <aside className="tosa-lifelines" aria-label="ตัวช่วย">
              {LIFELINES.map((lifeline) => {
                const isUsed = usedLifelines[lifeline.id]

                return (
                  <button
                    key={lifeline.id}
                    type="button"
                    className={`tosa-lifeline-card tosa-lifeline-card--${lifeline.id} ${
                      isUsed ? 'tosa-lifeline-card--used' : ''
                    }`}
                    onClick={() => useLifeline(lifeline.id)}
                    disabled={showAnswer || isUsed}
                    aria-label={`${lifeline.label}${isUsed ? ' (ใช้แล้ว)' : ''}`}
                  >
                    <span className="tosa-lifeline-card__icon" aria-hidden="true">
                      {lifeline.icon}
                    </span>
                    <span className="tosa-lifeline-card__label">{lifeline.label}</span>
                    <span className="tosa-lifeline-card__desc">{lifeline.description}</span>
                    {isUsed && <span className="tosa-lifeline-card__badge">ใช้แล้ว</span>}
                  </button>
                )
              })}
            </aside>

            <div className="tosa-play-main">
              <header className="tosa-round-header" aria-label={`รอบที่ ${roundIndex + 1}`}>
                <div className="tosa-round-header__pill" key={roundIndex}>
                  <span className="tosa-round-header__label">ROUND</span>
                  <span className="tosa-round-header__divider" aria-hidden="true" />
                  <span className="tosa-round-header__value">
                    {String(roundIndex + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="tosa-round-header__meta">
                  <span className="tosa-round-header__category">หมวด {category.name}</span>
                  <span className="tosa-round-header__dot" aria-hidden="true">
                    ·
                  </span>
                  <span>
                    {roundIndex + 1} / {category.rounds.length}
                  </span>
                </p>
              </header>

              <div className={`tosa-panel ${showAnswer ? 'tosa-panel--revealed' : ''}`}>
                <div className="tosa-panel__side tosa-panel__side--left" aria-hidden="true" />
                <div className="tosa-panel__inner">
                  <div className="tosa-reveal" key={roundIndex}>
                    {lifelineMessage && !showAnswer && (
                      <div
                        className={`tosa-lifeline-banner tosa-lifeline-banner--${lifelineMessage.type}`}
                        role="status"
                        aria-live="polite"
                      >
                        <span className="tosa-lifeline-banner__title">
                          {lifelineMessage.title}
                        </span>
                        <span className="tosa-lifeline-banner__text">{lifelineMessage.text}</span>
                      </div>
                    )}

                    <div
                      className={`tosa-face ${showAnswer ? 'tosa-face--full' : ''} ${
                        openMoreReduction > 0 ? 'tosa-face--opened-more' : ''
                      }`}
                    >
                      <img
                        src={currentRound.image}
                        alt=""
                        className="tosa-face__photo"
                      />
                      <div
                        className={`tosa-face__cover tosa-face__cover--${hideSide}`}
                        style={coverStyle}
                      />
                      <div
                        className="tosa-face__divider"
                        style={dividerStyle}
                        aria-hidden="true"
                      />
                      <span className="tosa-face__hint" style={hintStyle} aria-hidden="true">
                        ?
                      </span>
                    </div>
                  </div>
                </div>
                <div className="tosa-panel__side tosa-panel__side--right" aria-hidden="true" />
              </div>

              {showAnswer && (
                <p className="tosa-answer-name" role="status" aria-live="polite">
                  {currentRound.answer}
                </p>
              )}

              <div className="tosa-actions">
                <button
                  type="button"
                  className="hint-btn hint-btn--ghost tosa-actions__btn"
                  onClick={handleBack}
                  disabled={isFirstRound}
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  className="hint-btn hint-btn--gold tosa-actions__btn"
                  onClick={handleReveal}
                  disabled={showAnswer}
                  data-ui-click="off"
                >
                  เฉลย
                </button>
                <button
                  type="button"
                  className="hint-btn hint-btn--ghost tosa-actions__btn"
                  onClick={handleSkip}
                >
                  {isLastRound ? 'จบหมวด' : 'ข้าม'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
