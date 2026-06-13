import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import { siasaCategories } from '../data/siasaGameData'
import '../App.css'
import './HintGame.css'
import './SiasaGame.css'

export default function SiasaCategoryPage() {
  const navigate = useNavigate()

  return (
    <div className="landing landing--scroll">
      <PageBackground />

      <main className="landing__content hint-page">
        <header className="hint-page__header">
          <button
            type="button"
            className="hint-btn hint-btn--ghost"
            onClick={() => navigate('/')}
          >
            ← กลับหน้าแรก
          </button>
          <h1 className="hint-page__title">เลือกหมวด</h1>
        </header>

        <section className="siasa-category-grid" aria-label="หมวดเกมเสียสระ">
          {siasaCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`siasa-category-card ${
                category.available ? '' : 'siasa-category-card--soon'
              }`}
              disabled={!category.available}
              onClick={() => navigate(`/siasa/${category.id}`)}
            >
              <span className="siasa-category-card__letter" aria-hidden="true">
                {category.name}
              </span>
              <span className="siasa-category-card__icon" aria-hidden="true">
                🎭
              </span>
              <span className="siasa-category-card__label">{category.label}</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
