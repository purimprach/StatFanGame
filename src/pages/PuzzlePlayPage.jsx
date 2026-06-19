import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import GameStartGate from '../components/GameStartGate'
import RevealOverlay from '../components/RevealOverlay'
import { useRevealAnimation } from '../hooks/useRevealAnimation'
import { useBroadcastActiveQuestion, usePreparePlayPage, startLiveQuestion } from '../hooks/useActiveQuestion'
import { fetchFastestCorrectAnswer } from '../lib/answersApi'
import {
  getPuzzleCategoryById,
  getTileBackgroundPosition,
  PUZZLE_GRID_SIZE,
  PUZZLE_TILE_COUNT,
} from '../data/puzzleGameData'
import '../App.css'
import './HintGame.css'
import './PuzzleGame.css'

function formatWinnerName(winner) {
  if (!winner) {
    return 'ยังไม่มีผู้ตอบถูก'
  }

  return winner.branch ? `${winner.playerName} · ${winner.branch}` : winner.playerName
}

export default function PuzzlePlayPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = getPuzzleCategoryById(categoryId)
  const [gameStarted, setGameStarted] = useState(false)
  const [openedTiles, setOpenedTiles] = useState(() => new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [winnerData, setWinnerData] = useState(null)
  const [loadingWinner, setLoadingWinner] = useState(false)
  const [syncError, setSyncError] = useState('')

  usePreparePlayPage()

  useBroadcastActiveQuestion(
    category?.name ? 'jigsaw' : null,
    category?.name ?? null,
    category ? `จิ๊กซอว์ ${category.name}` : null,
    gameStarted,
  )

  const answerVisible = useRevealAnimation(showAnswer)
  const winnerVisible = useRevealAnimation(showWinner)

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
    if (!gameStarted) {
      return
    }

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
    setShowWinner(false)
    setWinnerData(null)
  }

  const handleShowWinner = async () => {
    if (showWinner) {
      setShowWinner(false)
      setWinnerData(null)
      return
    }

    setLoadingWinner(true)
    try {
      const winner = await fetchFastestCorrectAnswer({
        gameType: 'jigsaw',
        questionKey: category.name,
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

  const openedCount = openedTiles.size
  const interactionsLocked = !gameStarted || showAnswer

  const handleStartGame = async () => {
    setSyncError('')
    setGameStarted(true)

    try {
      await startLiveQuestion({
        gameType: 'jigsaw',
        questionKey: category.name,
        label: `จิ๊กซอว์ ${category.name}`,
      })
    } catch (error) {
      setGameStarted(false)
      setSyncError(error.message ?? 'เชื่อมมือถือไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
  }

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
              {showAnswer ? 'กลับไปเปิดการ์ด' : 'เฉลยคำตอบ'}
            </button>
          </div>
        </div>

        <header className="hint-page__header">
          <h1 className="hint-page__title">ภาพ {category.name}</h1>
          <p className="puzzle-progress">เปิดแล้ว {openedCount}/{PUZZLE_TILE_COUNT}</p>
          {syncError && <p className="game-sync-error">{syncError}</p>}
          {gameStarted && !syncError && (
            <p className="game-sync-ok">เปิดรับคำตอบจากมือถือแล้ว</p>
          )}
        </header>

        <GameStartGate started={gameStarted} onStart={handleStartGame}>
          <div
            className={`puzzle-stage ${showAnswer || showWinner ? 'puzzle-stage--revealed' : ''}`}
          >
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
                        disabled={interactionsLocked}
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
