import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import { useClearActiveQuestion } from '../hooks/useActiveQuestion'
import { puzzleCategories } from '../data/puzzleGameData'
import '../App.css'
import './HintGame.css'
import './PuzzleGame.css'

export default function PuzzleCategoryPage() {
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
          <h1 className="hint-page__title">เลือกภาพ</h1>
        </header>

        <section className="puzzle-category-grid" aria-label="ชุดภาพจิ๊กซอว์">
          {puzzleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`puzzle-category-card ${
                category.available ? '' : 'puzzle-category-card--soon'
              }`}
              disabled={!category.available}
              onClick={() => navigate(`/puzzle/${category.id}`)}
            >
              <span className="puzzle-category-card__letter" aria-hidden="true">
                {category.name}
              </span>
              <span
                className={`puzzle-category-card__placeholder ${
                  category.available ? 'puzzle-category-card__placeholder--ready' : ''
                }`}
              >
                {category.available ? (
                  <span className="puzzle-category-card__icon" aria-hidden="true">
                    🧩
                  </span>
                ) : (
                  'เร็วๆ นี้'
                )}
              </span>
              <span className="puzzle-category-card__label">{category.label}</span>
              <span className="puzzle-category-card__meta">16 การ์ด · 4×4</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
