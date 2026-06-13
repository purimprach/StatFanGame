import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import { getCategoryById } from '../data/hintGameData'
import '../App.css'
import './HintGame.css'

export default function HintPlayPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = getCategoryById(categoryId)
  const [openedHints, setOpenedHints] = useState(() => new Set())
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

  const closeAnswer = () => {
    setShowAnswer(false)
    setAnswerVisible(false)
  }

  if (!category) {
    return (
      <div className="landing">
        <PageBackground />
        <main className="landing__content hint-page">
          <p className="hint-page__subtitle">ไม่พบหมวดนี้</p>
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/hints')}
          >
            กลับไปเลือกหมวด
          </button>
        </main>
      </div>
    )
  }

  const toggleHint = (index) => {
    setOpenedHints((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="landing landing--scroll">
      <PageBackground />

      <main className="landing__content hint-page hint-page--play">
        <div className="hint-play-toolbar">
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/hints')}
          >
            ← กลับไปเลือกหมวด
          </button>
          <button
            type="button"
            className={
              showAnswer ? 'hint-btn hint-btn--ghost' : 'hint-btn hint-btn--gold'
            }
            onClick={() => (showAnswer ? closeAnswer() : setShowAnswer(true))}
          >
            {showAnswer ? 'กลับไปเปิดคำใบ้' : 'เฉลยคำตอบ'}
          </button>
        </div>

        <header className="hint-page__header">
          <h1 className="hint-page__title">{category.name}</h1>
        </header>

        <div className={`hint-play-stage ${showAnswer ? 'hint-play-stage--revealed' : ''}`}>
          <div className="hint-panel">
            <div className="hint-panel__side hint-panel__side--left" aria-hidden="true" />
            <div className="hint-panel__inner">
              <section className="hint-list" aria-label={`คำใบ้ ${category.name}`}>
                {category.hints.map((hint, index) => {
                  const isOpen = openedHints.has(index)

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`hint-box ${isOpen ? 'hint-box--open' : 'hint-box--closed'}`}
                      onClick={() => toggleHint(index)}
                      aria-expanded={isOpen}
                      disabled={showAnswer}
                      aria-label={
                        isOpen
                          ? `ปิดคำใบ้ ${index + 1}: ${hint}`
                          : `เปิดคำใบ้ ${index + 1}`
                      }
                    >
                      <span className="hint-box__flip">
                        <span className="hint-box__face hint-box__face--front">
                          <span className="hint-box__corners" aria-hidden="true" />
                          <span className="hint-box__label">{index + 1}</span>
                        </span>
                        <span className="hint-box__face hint-box__face--back">
                          <span className="hint-box__corners" aria-hidden="true" />
                          <span className="hint-box__label">{hint}</span>
                        </span>
                      </span>
                    </button>
                  )
                })}
              </section>
            </div>
            <div className="hint-panel__side hint-panel__side--right" aria-hidden="true" />
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
