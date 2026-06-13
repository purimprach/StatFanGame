import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import {
  getPuzzleCategoryById,
  getTileBackgroundPosition,
  PUZZLE_GRID_SIZE,
  PUZZLE_TILE_COUNT,
} from '../data/puzzleGameData'
import '../App.css'
import './HintGame.css'
import './PuzzleGame.css'

export default function PuzzlePlayPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = getPuzzleCategoryById(categoryId)
  const [openedTiles, setOpenedTiles] = useState(() => new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [answerVisible, setAnswerVisible] = useState(false)

  useEffect(() => {
    if (!showAnswer) {
      setAnswerVisible(false)
      return undefined
    }

    setAnswerVisible(false)
    const timer = window.setTimeout(() => setAnswerVisible(true), 3000)
    return () => window.clearTimeout(timer)
  }, [showAnswer])

  if (!category || !category.image) {
    return (
      <div className="landing">
        <PageBackground />
        <main className="landing__content hint-page">
          <p className="hint-page__subtitle">ไม่พบชุดภาพนี้</p>
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/puzzle')}
          >
            กลับไปเลือกภาพ
          </button>
        </main>
      </div>
    )
  }

  const toggleTile = (index) => {
    setOpenedTiles((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const closeAnswer = () => {
    setShowAnswer(false)
    setAnswerVisible(false)
  }

  const openedCount = openedTiles.size

  return (
    <div className="landing landing--puzzle-play">
      <PageBackground />

      <main className="landing__content hint-page hint-page--play hint-page--puzzle">
        <div className="hint-play-toolbar">
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/puzzle')}
          >
            ← กลับไปเลือกภาพ
          </button>
          <button
            type="button"
            className={
              showAnswer ? 'hint-btn hint-btn--ghost' : 'hint-btn hint-btn--gold'
            }
            onClick={() => (showAnswer ? closeAnswer() : setShowAnswer(true))}
          >
            {showAnswer ? 'กลับไปเปิดการ์ด' : 'เฉลยคำตอบ'}
          </button>
        </div>

        <header className="hint-page__header">
          <h1 className="hint-page__title">ภาพ {category.name}</h1>
          <p className="puzzle-progress">เปิดแล้ว {openedCount}/{PUZZLE_TILE_COUNT}</p>
        </header>

        <div className={`puzzle-stage ${showAnswer ? 'puzzle-stage--revealed' : ''}`}>
          <div className="puzzle-panel">
            <div className="puzzle-panel__side puzzle-panel__side--left" aria-hidden="true" />
            <div className="puzzle-panel__inner">
              <div
                className="puzzle-grid"
                style={{ aspectRatio: category.aspectRatio }}
                aria-label={`จิ๊กซอว์ภาพ ${category.name}`}
              >
                {Array.from({ length: PUZZLE_TILE_COUNT }, (_, index) => {
                  const isOpen = openedTiles.has(index)

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`puzzle-tile ${isOpen ? 'puzzle-tile--open' : 'puzzle-tile--closed'}`}
                      onClick={() => toggleTile(index)}
                      aria-expanded={isOpen}
                      disabled={showAnswer}
                      aria-label={
                        isOpen ? `ปิดการ์ด ${index + 1}` : `เปิดการ์ด ${index + 1}`
                      }
                    >
                      <span className="puzzle-tile__flip">
                        <span className="puzzle-tile__face puzzle-tile__face--front">
                          <span className="puzzle-tile__corners" aria-hidden="true" />
                          <span className="puzzle-tile__number">{index + 1}</span>
                        </span>
                        <span className="puzzle-tile__face puzzle-tile__face--back">
                          <span
                            className="puzzle-tile__piece"
                            style={{
                              backgroundImage: `url(${category.image})`,
                              backgroundSize: `${PUZZLE_GRID_SIZE * 100}% ${PUZZLE_GRID_SIZE * 100}%`,
                              backgroundPosition: getTileBackgroundPosition(index),
                            }}
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="puzzle-panel__side puzzle-panel__side--right" aria-hidden="true" />
          </div>

          {showAnswer && (
            <div className="answer-overlay" role="status" aria-live="polite">
              <div
                className={`answer-reveal ${
                  answerVisible ? 'answer-reveal--shown' : 'answer-reveal--building'
                }`}
              >
                {answerVisible ? (
                  <>
                    <span className="answer-reveal__label">คำตอบ</span>
                    <span className="answer-reveal__text">{category.answer}</span>
                  </>
                ) : (
                  <>
                    <div className="answer-buildup" aria-hidden="true">
                      <span className="answer-buildup__ring" />
                      <span className="answer-buildup__ring answer-buildup__ring--delay" />
                      <span className="answer-buildup__core" />
                    </div>
                    <span className="answer-reveal__label">คำตอบ</span>
                    <span className="answer-buildup__status">กำลังเฉลย...</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
