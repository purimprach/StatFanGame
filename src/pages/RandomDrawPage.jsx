import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import {
  DRAW_TIMING,
  getDrawTickDelay,
  playDrawStart,
  playDrawTick,
  playDrawWin,
} from '../lib/drawSounds'
import '../App.css'
import './HintGame.css'
import './RandomDrawPage.css'

const STUDENT_DRAW_OPTIONS = [
  ...BRANCH_OPTIONS.map((branch) => ({
    id: branch,
    label: `สุ่ม ${branch}`,
    shortLabel: branch,
  })),
  {
    id: 'all',
    label: 'สุ่มรวมทุกสาขา',
    shortLabel: 'รวม',
  },
]

export default function RandomDrawPage() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const isStudentMode = mode === 'students'
  const isTeacherMode = mode === 'teachers'
  const [drawLists, setDrawLists] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [activeScope, setActiveScope] = useState(null)
  const [highlightKey, setHighlightKey] = useState(null)
  const [spinningEntry, setSpinningEntry] = useState(null)
  const [spinTick, setSpinTick] = useState(0)
  const [winner, setWinner] = useState(null)
  const drawTimerRef = useRef(null)
  useClearActiveQuestion()

  useEffect(() => subscribeDrawLists(setDrawLists), [])

  const clearDrawTimer = useCallback(() => {
    if (drawTimerRef.current) {
      window.clearTimeout(drawTimerRef.current)
      drawTimerRef.current = null
    }
  }, [])

  useEffect(() => clearDrawTimer, [clearDrawTimer])

  const studentsByBranch = drawLists?.students ?? null
  const teacherNames = drawLists?.teachers ?? []

  const studentEntries = useMemo(
    () => (studentsByBranch ? flattenStudents(studentsByBranch) : []),
    [studentsByBranch],
  )

  const teacherEntries = useMemo(
    () => teacherNames.map((name) => ({ name, branch: null })),
    [teacherNames],
  )

  const totalCount = isStudentMode ? studentEntries.length : teacherNames.length
  const pageTitle = isStudentMode ? 'สุ่มรายชื่อนิสิต' : 'สุ่มรายชื่ออาจารย์'
  const pageSubtitle = isStudentMode
    ? 'เลือกสุ่มแยกสาขา หรือสุ่มรวมทุกสาขา'
    : 'รายชื่ออาจารย์ทั้งหมด'

  const getPool = useCallback(
    (scope) => {
      if (isTeacherMode) {
        return teacherEntries
      }

      if (!studentsByBranch) {
        return []
      }

      if (scope === 'all') {
        return studentEntries
      }

      return (studentsByBranch[scope] ?? []).map((name) => ({ name, branch: scope }))
    },
    [isStudentMode, isTeacherMode, studentEntries, studentsByBranch, teacherEntries],
  )

  const getScopeCount = useCallback(
    (scope) => getPool(scope).length,
    [getPool],
  )

  const handleDraw = (scope) => {
    const pool = getPool(scope)
    if (isDrawing || pool.length === 0) {
      return
    }

    clearDrawTimer()
    const finalWinner = pickRandomEntry(pool)
    if (!finalWinner) {
      return
    }

    setWinner(null)
    setIsDrawing(true)
    setActiveScope(scope)
    setHighlightKey(null)
    setSpinningEntry(pickRandomEntry(pool))
    setSpinTick(0)
    playDrawStart()

    const startedAt = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startedAt
      const progress = Math.min(elapsed / DRAW_TIMING.durationMs, 1)

      if (progress >= 1) {
        setSpinningEntry(finalWinner)
        setSpinTick((count) => count + 1)
        setHighlightKey(entryKey(finalWinner))
        setWinner(finalWinner)
        setIsDrawing(false)
        playDrawWin()
        return
      }

      const current = pickRandomEntry(pool)
      setSpinningEntry(current)
      setSpinTick((count) => count + 1)
      setHighlightKey(entryKey(current))
      playDrawTick(progress)

      const delay = getDrawTickDelay(progress)
      drawTimerRef.current = window.setTimeout(tick, delay)
    }

    drawTimerRef.current = window.setTimeout(tick, DRAW_TIMING.minDelayMs)
  }

  const scopeLabel =
    activeScope === 'all'
      ? 'ทุกสาขา'
      : activeScope
        ? STUDENT_BRANCH_LABELS[activeScope] ?? activeScope
        : null

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
            {isDrawing && spinningEntry ? (
              <>
                <span className="random-draw-page__result-label">
                  กำลังสุ่ม{scopeLabel ? ` · ${scopeLabel}` : ''}...
                </span>
                <span
                  key={spinTick}
                  className="random-draw-page__result-name random-draw-page__spin-name"
                >
                  {spinningEntry.name}
                </span>
                {spinningEntry.branch && (
                  <span className="random-draw-page__result-branch random-draw-page__spin-branch">
                    {spinningEntry.branch}
                  </span>
                )}
              </>
            ) : winner ? (
              <>
                <span className="random-draw-page__result-label">ได้แก่</span>
                <span className="random-draw-page__result-name random-draw-page__winner-pop">
                  {winner.name}
                </span>
                {winner.branch && (
                  <span className="random-draw-page__result-branch">{winner.branch}</span>
                )}
              </>
            ) : (
              <>
                <span className="random-draw-page__result-label">พร้อมสุ่ม</span>
                <span className="random-draw-page__result-placeholder">
                  {totalCount > 0 ? `ทั้งหมด ${totalCount} คน` : 'ยังไม่มีรายชื่อ'}
                </span>
              </>
            )}
          </div>

          {isStudentMode ? (
            <div className="random-draw-page__draw-actions random-draw-page__draw-actions--four">
              {STUDENT_DRAW_OPTIONS.map((option) => {
                const count = getScopeCount(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`hint-btn random-draw-page__scope-btn random-draw-page__scope-btn--${option.id.toLowerCase()} ${
                      activeScope === option.id && isDrawing
                        ? 'random-draw-page__scope-btn--active'
                        : ''
                    }`}
                    onClick={() => handleDraw(option.id)}
                    disabled={isDrawing || count === 0}
                  >
                    <span className="random-draw-page__scope-btn-label">{option.label}</span>
                    <span className="random-draw-page__scope-btn-meta">{count} คน</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <button
              type="button"
              className="hint-btn hint-btn--gold random-draw-page__draw-btn"
              onClick={() => handleDraw('all')}
              disabled={isDrawing || totalCount === 0}
            >
              {isDrawing ? 'กำลังสุ่ม...' : 'สุ่ม'}
            </button>
          )}
        </section>

        {totalCount === 0 && (
          <p className="random-draw-page__admin-hint">
            แอดมินกรอกรายชื่อที่หน้า <strong>/admin-answers</strong> ในส่วน「สุ่มรายชื่อ」ก่อน
          </p>
        )}

        {isStudentMode && studentsByBranch && (
          <section className="random-draw-page__lists" aria-label="รายชื่อนิสิตแยกสาขา">
            {BRANCH_OPTIONS.map((branch) => (
              <div
                key={branch}
                className={`random-draw-page__branch random-draw-page__branch--${branch.toLowerCase()} ${
                  activeScope === branch && isDrawing ? 'random-draw-page__branch--drawing' : ''
                }`}
              >
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
