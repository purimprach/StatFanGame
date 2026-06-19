import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import GameStartGate from '../components/GameStartGate'
import RevealOverlay from '../components/RevealOverlay'
import { useRevealAnimation } from '../hooks/useRevealAnimation'
import { useBroadcastActiveQuestion, usePreparePlayPage, startLiveQuestion } from '../hooks/useActiveQuestion'
import { fetchDeclaredWinner } from '../lib/winnerSelection'
import { getCategoryById, getHintQuestionKey } from '../data/hintGameData'
import { getQuestionLabel } from '../data/questions'
import '../App.css'
import './HintGame.css'

function formatWinnerName(winner) {
  if (!winner) {
    return 'ยังไม่ได้เลือกผู้ชนะจากแอดมิน'
  }

  return winner.branch ? `${winner.playerName} · ${winner.branch}` : winner.playerName
}

export default function HintPlayPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = getCategoryById(categoryId)
  const [gameStarted, setGameStarted] = useState(false)
  const [openedHints, setOpenedHints] = useState(() => new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [winnerData, setWinnerData] = useState(null)
  const [loadingWinner, setLoadingWinner] = useState(false)
  const [syncError, setSyncError] = useState('')

  const hintQuestionKey = category ? getHintQuestionKey(category.id) : null

  usePreparePlayPage()

  useBroadcastActiveQuestion(
    hintQuestionKey ? 'hint' : null,
    hintQuestionKey,
    hintQuestionKey ? getQuestionLabel('hint', hintQuestionKey) : null,
    gameStarted,
  )

  const answerVisible = useRevealAnimation(showAnswer)
  const winnerVisible = useRevealAnimation(showWinner)

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
    if (!gameStarted) {
      return
    }

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

  const closeAnswer = () => {
    setShowAnswer(false)
    setShowWinner(false)
    setWinnerData(null)
  }

  const handleShowWinner = async () => {
    if (showWinner) {
      setShowWinner(false)
      setWinnerData(null)
      return
    }

    const questionKey = getHintQuestionKey(category.id)
    if (!questionKey) {
      return
    }

    setLoadingWinner(true)
    try {
      const winner = await fetchDeclaredWinner({
        gameType: 'hint',
        questionKey,
      })
      setWinnerData(winner)
      setShowWinner(true)
    } catch {
      setWinnerData(null)
      setShowWinner(true)
    } finally {
      setLoadingWinner(false)
    }
  }

  const interactionsLocked = !gameStarted || showAnswer

  const handleStartGame = async () => {
    if (!hintQuestionKey) {
      return
    }

    setSyncError('')
    setGameStarted(true)

    try {
      await startLiveQuestion({
        gameType: 'hint',
        questionKey: hintQuestionKey,
        label: getQuestionLabel('hint', hintQuestionKey),
      })
    } catch (error) {
      setGameStarted(false)
      setSyncError(error.message ?? 'เชื่อมมือถือไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
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
          <div className="hint-play-toolbar__actions">
            {gameStarted && showAnswer && (
              <button
                type="button"
                className={
                  showWinner ? 'hint-btn hint-btn--ghost' : 'hint-btn hint-btn--gold'
                }
                onClick={handleShowWinner}
                disabled={loadingWinner}
              >
                {loadingWinner
                  ? 'กำลังโหลด...'
                  : showWinner
                    ? 'ปิดผู้ชนะ'
                    : 'คนตอบถูกเร็วที่สุด'}
              </button>
            )}
            <button
              type="button"
              className={
                showAnswer ? 'hint-btn hint-btn--ghost' : 'hint-btn hint-btn--gold'
              }
              onClick={() => (showAnswer ? closeAnswer() : setShowAnswer(true))}
              disabled={!gameStarted}
            >
              {showAnswer ? 'กลับไปเปิดคำใบ้' : 'เฉลยคำตอบ'}
            </button>
          </div>
        </div>

        <header className="hint-page__header">
          <h1 className="hint-page__title">{category.name}</h1>
          {syncError && <p className="game-sync-error">{syncError}</p>}
          {gameStarted && !syncError && (
            <p className="game-sync-ok">เปิดรับคำตอบจากมือถือแล้ว</p>
          )}
        </header>

        <GameStartGate started={gameStarted} onStart={handleStartGame}>
          <div
            className={`hint-play-stage ${showAnswer || showWinner ? 'hint-play-stage--revealed' : ''}`}
          >
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
                        disabled={interactionsLocked}
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
              <RevealOverlay
                label="คำตอบ"
                text={category.answer}
                visible={answerVisible}
              />
            )}

            {showWinner && (
              <RevealOverlay
                label="คนตอบถูกเร็วที่สุด"
                text={formatWinnerName(winnerData)}
                buildingStatus="กำลังประกาศ..."
                visible={winnerVisible}
              />
            )}
          </div>
        </GameStartGate>
      </main>
    </div>
  )
}
