import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import { useClearActiveQuestion } from '../hooks/useActiveQuestion'
import { hintCategories } from '../data/hintGameData'
import '../App.css'
import './HintGame.css'

export default function HintCategoryPage() {
  const navigate = useNavigate()
  useClearActiveQuestion()

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

        <section className="category-grid" aria-label="หมวดคำใบ้">
          {hintCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="category-card"
              onClick={() => navigate(`/hints/${category.id}`)}
            >
              <span className="category-card__icon" aria-hidden="true">
                {category.icon}
              </span>
              <span className="category-card__name">{category.name}</span>
              <span className="category-card__meta">5 คำใบ้ · 1 เฉลย</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
