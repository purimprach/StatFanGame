import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import { useClearActiveQuestion } from '../hooks/useActiveQuestion'
import {
  flattenStudents,
  pickRandomEntry,
  STUDENT_BRANCH_LABELS,
} from '../data/randomDrawData'
import { BRANCH_OPTIONS } from '../data/questions'
import { subscribeDrawLists } from '../lib/drawLists'
import '../App.css'
import './HintGame.css'
import './RandomDrawPage.css'

const DRAW_TICK_MS = 85
const DRAW_DURATION_MS = 2600

export default function RandomDrawPage() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const isStudentMode = mode === 'students'
  const isTeacherMode = mode === 'teachers'
  const [drawLists, setDrawLists] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [highlightKey, setHighlightKey] = useState(null)
  const [winner, setWinner] = useState(null)
  const drawTimerRef = useRef(null)
  useClearActiveQuestion()

  useEffect(() => subscribeDrawLists(setDrawLists), [])

  useEffect(() => {
    return () => {
      if (drawTimerRef.current) {
        window.clearInterval(drawTimerRef.current)
      }
    }
  }, [])

  const studentsByBranch = drawLists?.students ?? null
  const teacherNames = drawLists?.teachers ?? []

  const studentEntries = useMemo(
    () => (studentsByBranch ? flattenStudents(studentsByBranch) : []),
    [studentsByBranch],
  )

  const pool = isStudentMode ? studentEntries : teacherNames.map((name) => ({ name, branch: null }))
  const totalCount = isStudentMode ? studentEntries.length : teacherNames.length
  const pageTitle = isStudentMode ? 'สุ่มรายชื่อนิสิต' : 'สุ่มรายชื่ออาจารย์'
  const pageSubtitle = isStudentMode
    ? 'รายชื่อแยกตามสาขา BIT · INS · STAT'
    : 'รายชื่ออาจารย์ทั้งหมด'

  const handleDraw = () => {
    if (isDrawing || pool.length === 0) {
      return
    }

    setWinner(null)
    setIsDrawing(true)
    setHighlightKey(null)

    const startedAt = Date.now()

    drawTimerRef.current = window.setInterval(() => {
      const entry = pickRandomEntry(pool)
      if (!entry) {
        return
      }

      setHighlightKey(entryKey(entry))

      if (Date.now() - startedAt >= DRAW_DURATION_MS) {
        window.clearInterval(drawTimerRef.current)
        drawTimerRef.current = null

        const finalEntry = pickRandomEntry(pool)
        if (finalEntry) {
          setHighlightKey(entryKey(finalEntry))
          setWinner(finalEntry)
        }

        setIsDrawing(false)
      }
    }, DRAW_TICK_MS)
  }

  if (!isStudentMode && !isTeacherMode) {
    return (
      <div className="landing landing--scroll">
        <PageBackground />
        <main className="landing__content hint-page random-draw-page">
          <p className="random-draw-page__empty">ไม่พบหน้าสุ่มรายชื่อนี้</p>
          <button type="button" className="hint-btn hint-btn--ghost" onClick={() => navigate('/')}>
            กลับหน้าแรก
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="landing landing--scroll">
      <PageBackground />

      <main className="landing__content hint-page random-draw-page">
        <header className="hint-page__header random-draw-page__header">
          <button type="button" className="hint-btn hint-btn--ghost" onClick={() => navigate('/')}>
            ← กลับหน้าแรก
          </button>
          <h1 className="hint-page__title">{pageTitle}</h1>
          <p className="hint-page__subtitle">{pageSubtitle}</p>
        </header>

        <section className="random-draw-page__stage" aria-live="polite">
          <div
            className={`random-draw-page__result ${
              winner ? 'random-draw-page__result--winner' : ''
            } ${isDrawing ? 'random-draw-page__result--drawing' : ''}`}
          >
            {winner ? (
              <>
                <span className="random-draw-page__result-label">ได้แก่</span>
                <span className="random-draw-page__result-name">{winner.name}</span>
                {winner.branch && (
                  <span className="random-draw-page__result-branch">{winner.branch}</span>
                )}
              </>
            ) : (
              <>
                <span className="random-draw-page__result-label">
                  {isDrawing ? 'กำลังสุ่ม...' : 'พร้อมสุ่ม'}
                </span>
                <span className="random-draw-page__result-placeholder">
                  {totalCount > 0 ? `ทั้งหมด ${totalCount} คน` : 'ยังไม่มีรายชื่อ'}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            className="hint-btn hint-btn--gold random-draw-page__draw-btn"
            onClick={handleDraw}
            disabled={isDrawing || totalCount === 0}
          >
            {isDrawing ? 'กำลังสุ่ม...' : 'สุ่ม'}
          </button>
        </section>

        {totalCount === 0 && (
          <p className="random-draw-page__admin-hint">
            แอดมินกรอกรายชื่อที่หน้า <strong>/admin-answers</strong> ในส่วน「สุ่มรายชื่อ」ก่อน
          </p>
        )}

        {isStudentMode && studentsByBranch && (
          <section className="random-draw-page__lists" aria-label="รายชื่อนิสิตแยกสาขา">
            {BRANCH_OPTIONS.map((branch) => (
              <div key={branch} className="random-draw-page__branch">
                <h2 className="random-draw-page__branch-title">
                  {STUDENT_BRANCH_LABELS[branch]}
                  <span className="random-draw-page__branch-count">
                    {(studentsByBranch[branch] ?? []).length} คน
                  </span>
                </h2>
                <ul className="random-draw-page__name-list">
                  {(studentsByBranch[branch] ?? []).length === 0 ? (
                    <li className="random-draw-page__name-item random-draw-page__name-item--empty">
                      ยังไม่มีรายชื่อ
                    </li>
                  ) : (
                    (studentsByBranch[branch] ?? []).map((name) => {
                      const key = entryKey({ name, branch })
                      return (
                        <li
                          key={key}
                          className={`random-draw-page__name-item ${
                            highlightKey === key ? 'random-draw-page__name-item--active' : ''
                          } ${
                            winner && entryKey(winner) === key
                              ? 'random-draw-page__name-item--winner'
                              : ''
                          }`}
                        >
                          {name}
                        </li>
                      )
                    })
                  )}
                </ul>
              </div>
            ))}
          </section>
        )}

        {isTeacherMode && (
          <section className="random-draw-page__lists random-draw-page__lists--single" aria-label="รายชื่ออาจารย์">
            <div className="random-draw-page__branch random-draw-page__branch--full">
              <h2 className="random-draw-page__branch-title">
                อาจารย์
                <span className="random-draw-page__branch-count">{teacherNames.length} คน</span>
              </h2>
              <ul className="random-draw-page__name-list random-draw-page__name-list--teachers">
                {teacherNames.length === 0 ? (
                  <li className="random-draw-page__name-item random-draw-page__name-item--empty">
                    ยังไม่มีรายชื่อ
                  </li>
                ) : (
                  teacherNames.map((name) => {
                    const key = entryKey({ name, branch: null })
                    return (
                      <li
                        key={key}
                        className={`random-draw-page__name-item ${
                          highlightKey === key ? 'random-draw-page__name-item--active' : ''
                        } ${
                          winner && entryKey(winner) === key
                            ? 'random-draw-page__name-item--winner'
                            : ''
                        }`}
                      >
                        {name}
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function entryKey({ name, branch }) {
  return branch ? `${branch}::${name}` : name
}
