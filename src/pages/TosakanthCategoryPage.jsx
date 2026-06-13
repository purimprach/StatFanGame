import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import { tosakanthCategories } from '../data/tosakanthGameData'
import '../App.css'
import './HintGame.css'
import './TosakanthGame.css'

export default function TosakanthCategoryPage() {
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

        <section className="tosa-category-grid" aria-label="หมวดเกมทศกัณฐ์">
          {tosakanthCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`tosa-category-card ${
                category.available ? '' : 'tosa-category-card--soon'
              }`}
              disabled={!category.available}
              onClick={() => navigate(`/tosakanth/${category.id}`)}
            >
              <span className="tosa-category-card__letter" aria-hidden="true">
                {category.name}
              </span>
              <span className="tosa-category-card__icon-wrap" aria-hidden="true">
                <span className="tosa-category-card__half tosa-category-card__half--visible" />
                <span className="tosa-category-card__half tosa-category-card__half--hidden" />
              </span>
              <span className="tosa-category-card__label">{category.label}</span>
              <span className="tosa-category-card__meta">ปิดครึ่งหน้า · ทายชื่อ</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
