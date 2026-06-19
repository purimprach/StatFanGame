import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import PrizeRevealOverlay from '../components/PrizeRevealOverlay'
import QrJoinModal from '../components/QrJoinModal'
import {
  buildFirstArrivalPrize,
  buildFirstTeacherPrize,
  resolvePrizeView,
  SPECIAL_PRIZES,
} from '../data/specialPrizes'
import { subscribeFirstArrivalPrize } from '../lib/firstArrivalPrize'
import { subscribeFirstTeacherPrize } from '../lib/firstTeacherPrize'
import { useRevealAnimation } from '../hooks/useRevealAnimation'
import { useClearActiveQuestion } from '../hooks/useActiveQuestion'
import '../App.css'
import './HintGame.css'

const games = [
  {
    id: 'math',
    title: 'เกมทศกัณฐ์ STAT#55',
    description: 'ปิดครึ่งหน้าแล้วทายว่าใคร',
    icon: '🔢',
    available: true,
    path: '/tosakanth',
  },
  {
    id: 'puzzle',
    title: 'เกมจิ๊กซอว์',
    description: 'ต่อภาพความทรงจำของชาวสถิติ',
    icon: '🧩',
    available: true,
    path: '/puzzle',
  },
  {
    id: 'hints',
    title: 'เกมเปิดคำใบ้',
    description: 'เปิดคำใบ้ทีละข้อแล้วทายคำตอบ',
    icon: '💡',
    available: true,
    path: '/hints',
  },
  {
    id: 'siasa',
    title: 'เกมเสียสระ',
    description: 'ทายผิดแล้วเสียสระ',
    icon: '🎭',
    available: true,
    path: '/siasa',
  },
]

function GameCard({ game, onPlay }) {
  return (
    <article className={`game-card ${game.available ? '' : 'game-card--soon'}`}>
      <div className="game-card__glow" aria-hidden="true" />
      <div className="game-card__gold-ring" aria-hidden="true" />
      <span className="game-card__icon" aria-hidden="true">
        {game.icon}
      </span>
      <h2 className="game-card__title">{game.title}</h2>
      <p className="game-card__description">{game.description}</p>
      <button
        type="button"
        className="game-card__button"
        disabled={!game.available}
        onClick={() => onPlay(game)}
      >
        เริ่มเล่น
      </button>
    </article>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [showQr, setShowQr] = useState(false)
  const [activePrizeId, setActivePrizeId] = useState(null)
  const [lastFormStep, setLastFormStep] = useState(0)
  const [firstArrivalSetting, setFirstArrivalSetting] = useState(null)
  const [firstTeacherSetting, setFirstTeacherSetting] = useState(null)
  useClearActiveQuestion()

  useEffect(() => subscribeFirstArrivalPrize(setFirstArrivalSetting), [])
  useEffect(() => subscribeFirstTeacherPrize(setFirstTeacherSetting), [])

  const prizeList = useMemo(
    () => [
      buildFirstArrivalPrize(firstArrivalSetting),
      buildFirstTeacherPrize(firstTeacherSetting),
      SPECIAL_PRIZES.firstFormRegistration,
      SPECIAL_PRIZES.lastFormRegistration,
    ],
    [firstArrivalSetting, firstTeacherSetting],
  )

  const activePrize = prizeList.find((prize) => prize.id === activePrizeId) ?? null
  const displayedPrize = activePrize ? resolvePrizeView(activePrize, lastFormStep) : null
  const revealReplayKey =
    activePrize?.id === 'last-form' ? `last-form-${lastFormStep}` : activePrizeId
  const prizeContentVisible = useRevealAnimation(Boolean(displayedPrize), revealReplayKey)

  const handlePlay = (game) => {
    if (game.path) {
      navigate(game.path)
    }
  }

  const handlePrizeClick = (prizeId) => {
    setActivePrizeId((current) => {
      if (current === prizeId) {
        setLastFormStep(0)
        return null
      }

      if (prizeId === 'last-form') {
        setLastFormStep(0)
      }

      return prizeId
    })
  }

  const handleClosePrize = () => {
    setActivePrizeId(null)
    setLastFormStep(0)
  }

  const handleAdvanceLastForm = () => {
    setLastFormStep(1)
  }

  return (
    <div className="landing">
      <PageBackground />

      <main className="landing__content">
        <header className="landing__header">
          <p className="landing__badge">STAT#55 Bye Nior Game Show 2026</p>
          <h1 className="landing__title">
            <span className="landing__title-line">แฟนพันธุ์แท้</span>
            <span className="landing__title-accent">STAT#55</span>
          </h1>
          <p className="landing__subtitle">
            เกมวัดความเป็นตัวจริงของชาวสถิติ
          </p>
          <button
            type="button"
            className="landing__qr-btn"
            onClick={() => setShowQr(true)}
          >
            สแกน QR Code เพื่อร่วมสนุก
          </button>
          <div className="landing__divider" aria-hidden="true" />
        </header>

        <QrJoinModal open={showQr} onClose={() => setShowQr(false)} />

        <section className="game-grid" aria-label="รายการเกม">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlay={handlePlay} />
          ))}
        </section>

        <section className="landing__prizes" aria-label="สุ่มรายชื่อ">
          <h2 className="landing__prizes-title">สุ่มรายชื่อ</h2>
          <div className="landing__prize-actions">
            <button
              type="button"
              className="landing__prize-btn"
              onClick={() => navigate('/random/students')}
            >
              สุ่มรายชื่อนิสิต
            </button>
            <button
              type="button"
              className="landing__prize-btn"
              onClick={() => navigate('/random/teachers')}
            >
              สุ่มรายชื่ออาจารย์
            </button>
          </div>
        </section>

        <section className="landing__prizes" aria-label="รางวัลพิเศษ">
          <h2 className="landing__prizes-title">รางวัลพิเศษ</h2>
          <div className="landing__prize-actions">
            {prizeList.map((prize) => (
              <button
                key={prize.id}
                type="button"
                className={`landing__prize-btn ${
                  activePrizeId === prize.id ? 'landing__prize-btn--active' : ''
                }`}
                onClick={() => handlePrizeClick(prize.id)}
              >
                {activePrizeId === prize.id ? 'ปิดการประกาศ' : prize.buttonLabel}
              </button>
            ))}
          </div>
        </section>
      </main>

      {displayedPrize && (
        <PrizeRevealOverlay
          prize={displayedPrize}
          visible
          contentVisible={prizeContentVisible}
          onClose={handleClosePrize}
          advanceLabel={displayedPrize.advanceLabel}
          onAdvance={displayedPrize.advanceLabel ? handleAdvanceLastForm : undefined}
        />
      )}
    </div>
  )
}
