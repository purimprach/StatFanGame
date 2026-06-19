import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import QrJoinModal from '../components/QrJoinModal'
import '../App.css'

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

  const handlePlay = (game) => {
    if (game.path) {
      navigate(game.path)
    }
  }

  return (
    <div className="landing">
      <PageBackground />

      <main className="landing__content">
        <header className="landing__header">
          <p className="landing__badge">STAT#55 Reunion Game Show 2026</p>
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
      </main>
    </div>
  )
}
