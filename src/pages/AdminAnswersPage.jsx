import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearAllAnswers,
  fetchAllAnswers,
  isUsingLocalDemo,
  sortAnswers,
} from '../lib/answersApi'
import {
  clearWinnerSelection,
  setWinnerSelection as saveWinnerSelection,
  subscribeWinnerSelection,
} from '../lib/winnerSelection'
import {
  clearFirstArrivalPrize,
  saveFirstArrivalPrize,
  subscribeFirstArrivalPrize,
} from '../lib/firstArrivalPrize'
import {
  clearFirstTeacherPrize,
  saveFirstTeacherPrize,
  subscribeFirstTeacherPrize,
} from '../lib/firstTeacherPrize'
import {
  BRANCH_OPTIONS,
  getQuestionLabel,
  getQuestionValue,
  QUESTION_OPTIONS,
} from '../data/questions'
import AdminPrizePanel from '../components/AdminPrizePanel'
import './AdminAnswersPage.css'

function formatDateTime(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

function formatWinnerLabel(selection) {
  if (!selection?.playerName) {
    return 'ยังไม่เลือก'
  }

  return selection.branch
    ? `${selection.playerName} · ${selection.branch}`
    : selection.playerName
}

export default function AdminAnswersPage() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [winnerSelection, setWinnerSelection] = useState(null)
  const [savingWinnerId, setSavingWinnerId] = useState(null)
  const [arrivalName, setArrivalName] = useState('')
  const [arrivalStudentId, setArrivalStudentId] = useState('')
  const [arrivalBranch, setArrivalBranch] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [arrivalSaved, setArrivalSaved] = useState(null)
  const [savingArrival, setSavingArrival] = useState(false)
  const [teacherName, setTeacherName] = useState('')
  const [teacherTitle, setTeacherTitle] = useState('')
  const [teacherTime, setTeacherTime] = useState('')
  const [teacherSaved, setTeacherSaved] = useState(null)
  const [savingTeacher, setSavingTeacher] = useState(false)
  const [arrivalPanelOpen, setArrivalPanelOpen] = useState(false)
  const [teacherPanelOpen, setTeacherPanelOpen] = useState(false)

  const loadAnswers = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await fetchAllAnswers()
      setRows(sortAnswers(data))
    } catch (error) {
      setErrorMessage(error.message ?? 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnswers()
  }, [loadAnswers])

  useEffect(() => {
    return subscribeFirstArrivalPrize((setting) => {
      setArrivalSaved(setting)
      setArrivalName(setting?.displayName ?? '')
      setArrivalStudentId(setting?.studentId ?? '')
      setArrivalBranch(setting?.branch ?? '')
      setArrivalTime(setting?.arrivedAt ?? '')
    })
  }, [])

  useEffect(() => {
    return subscribeFirstTeacherPrize((setting) => {
      setTeacherSaved(setting)
      setTeacherName(setting?.displayName ?? '')
      setTeacherTitle(setting?.teacherTitle ?? '')
      setTeacherTime(setting?.arrivedAt ?? '')
    })
  }, [])

  const demoMode = isUsingLocalDemo()

  const filteredRows = useMemo(() => {
    if (filter === 'all') {
      return rows
    }
    const [gameType, questionKey] = filter.split(':')
    return rows.filter(
      (row) => row.game_type === gameType && row.question_key === questionKey,
    )
  }, [rows, filter])

  const rankedRows = useMemo(() => sortAnswers(filteredRows), [filteredRows])

  const activeQuestion = useMemo(() => {
    if (filter === 'all') {
      return null
    }

    const [gameType, questionKey] = filter.split(':')
    return { gameType, questionKey }
  }, [filter])

  useEffect(() => {
    if (!activeQuestion) {
      setWinnerSelection(null)
      return undefined
    }

    return subscribeWinnerSelection(activeQuestion, setWinnerSelection)
  }, [activeQuestion])

  const handlePickWinner = async (row) => {
    setSavingWinnerId(row.id)
    setActionMessage('')
    setErrorMessage('')

    try {
      const selection = await saveWinnerSelection({
        gameType: row.game_type,
        questionKey: row.question_key,
        playerName: row.player_name,
        branch: row.branch,
        answerText: row.answer_text,
        sourceAnswerId: row.id,
      })
      setWinnerSelection(selection)
      setActionMessage(`ตั้ง ${row.player_name} เป็นผู้ชนะบนเวทีแล้ว`)
    } catch (error) {
      setErrorMessage(error.message ?? 'บันทึกผู้ชนะไม่สำเร็จ')
    } finally {
      setSavingWinnerId(null)
    }
  }

  const handleClearWinner = async () => {
    if (!activeQuestion) {
      return
    }

    setActionMessage('')
    setErrorMessage('')

    try {
      await clearWinnerSelection(activeQuestion)
      setWinnerSelection(null)
      setActionMessage('ล้างผู้ชนะบนเวทีแล้ว')
    } catch (error) {
      setErrorMessage(error.message ?? 'ล้างผู้ชนะไม่สำเร็จ')
    }
  }

  const isWinnerRow = (row) => {
    if (!winnerSelection) {
      return false
    }

    if (winnerSelection.sourceAnswerId && row.id) {
      return winnerSelection.sourceAnswerId === row.id
    }

    return (
      winnerSelection.gameType === row.game_type &&
      winnerSelection.questionKey === row.question_key &&
      winnerSelection.playerName === row.player_name &&
      winnerSelection.answerText === row.answer_text
    )
  }

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      'ล้างคำตอบทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้',
    )
    if (!confirmed) {
      return
    }

    try {
      await clearAllAnswers()
      setRows([])
      setWinnerSelection(null)
      setActionMessage('ล้างคำตอบทั้งหมดแล้ว')
    } catch (error) {
      setErrorMessage(error.message ?? 'ล้างข้อมูลไม่สำเร็จ')
    }
  }

  const handleSaveArrivalPrize = async (event) => {
    event.preventDefault()
    setSavingArrival(true)
    setErrorMessage('')
    setActionMessage('')

    try {
      const saved = await saveFirstArrivalPrize({
        displayName: arrivalName,
        studentId: arrivalStudentId,
        branch: arrivalBranch,
        arrivedAt: arrivalTime,
      })
      setArrivalSaved(saved)
      setActionMessage(`บันทึกผู้มางานคนแรกแล้ว — ${saved.displayName}`)
    } catch (error) {
      setErrorMessage(error.message ?? 'บันทึกผู้มางานคนแรกไม่สำเร็จ')
    } finally {
      setSavingArrival(false)
    }
  }

  const handleClearArrivalPrize = async () => {
    setSavingArrival(true)
    setErrorMessage('')
    setActionMessage('')

    try {
      await clearFirstArrivalPrize()
      setArrivalSaved(null)
      setArrivalName('')
      setArrivalStudentId('')
      setArrivalBranch('')
      setArrivalTime('')
      setActionMessage('ล้างข้อมูลผู้มางานคนแรกแล้ว')
    } catch (error) {
      setErrorMessage(error.message ?? 'ล้างข้อมูลไม่สำเร็จ')
    } finally {
      setSavingArrival(false)
    }
  }

  const handleSaveTeacherPrize = async (event) => {
    event.preventDefault()
    setSavingTeacher(true)
    setErrorMessage('')
    setActionMessage('')

    try {
      const saved = await saveFirstTeacherPrize({
        displayName: teacherName,
        teacherTitle: teacherTitle,
        arrivedAt: teacherTime,
      })
      setTeacherSaved(saved)
      setActionMessage(`บันทึกอาจารย์มางานคนแรกแล้ว — ${saved.displayName}`)
    } catch (error) {
      setErrorMessage(error.message ?? 'บันทึกอาจารย์มางานคนแรกไม่สำเร็จ')
    } finally {
      setSavingTeacher(false)
    }
  }

  const handleClearTeacherPrize = async () => {
    setSavingTeacher(true)
    setErrorMessage('')
    setActionMessage('')

    try {
      await clearFirstTeacherPrize()
      setTeacherSaved(null)
      setTeacherName('')
      setTeacherTitle('')
      setTeacherTime('')
      setActionMessage('ล้างข้อมูลอาจารย์มางานคนแรกแล้ว')
    } catch (error) {
      setErrorMessage(error.message ?? 'ล้างข้อมูลไม่สำเร็จ')
    } finally {
      setSavingTeacher(false)
    }
  }

  return (
    <div className="admin-page">
      {demoMode && (
        <p className="admin-demo-banner">
          โหมดทดสอบ — แสดงคำตอบจาก localStorage ในเครื่องนี้
        </p>
      )}
      <header className="admin-header">
        <div>
          <p className="admin-badge">STAT#55 · Admin</p>
          <h1>คำตอบจากผู้ชม</h1>
          <p className="admin-subtitle">
            แอดมินเลือกผู้ชนะเอง · คอลัมน์ถูก/ผิดเป็นแค่ช่วยดู
          </p>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={loadAnswers}
            disabled={loading}
          >
            {loading ? 'กำลังโหลด...' : 'Refresh'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={handleClearAll}
            disabled={loading || rows.length === 0}
          >
            ล้างคำตอบทั้งหมด
          </button>
        </div>
      </header>

      <section className="admin-prize-panels">
        <div className="admin-prize-panels__intro">
          <h2 className="admin-prize-panels__title">รางวัลพิเศษ · กรอกวันงาน</h2>
          <p className="admin-prize-panels__subtitle">
            กด「ขยาย」เพื่อกรอกชื่อ — จอ MC อัปเดตอัตโนมัติหลังบันทึก
          </p>
        </div>

        <AdminPrizePanel
          label="รางวัลมางานคนแรก"
          hint="กรอกชื่อเมื่อรู้ผู้มางานคนแรกแล้ว — ปุ่ม MC「รางวัลพิเศษ สำหรับคนที่มางานคนแรก」"
          savedName={arrivalSaved?.displayName}
          open={arrivalPanelOpen}
          onToggle={() => setArrivalPanelOpen((current) => !current)}
        >
        <form className="admin-arrival-form" onSubmit={handleSaveArrivalPrize}>
          <label className="admin-arrival-form__field admin-arrival-form__field--wide">
            <span>ชื่อ-นามสกุล</span>
            <input
              type="text"
              value={arrivalName}
              onChange={(event) => setArrivalName(event.target.value)}
              placeholder="เช่น นาย สมชาย ใจดี"
              required
            />
          </label>
          <label className="admin-arrival-form__field">
            <span>รหัสนิสิต</span>
            <input
              type="text"
              inputMode="numeric"
              value={arrivalStudentId}
              onChange={(event) => setArrivalStudentId(event.target.value)}
              placeholder="6542..."
            />
          </label>
          <label className="admin-arrival-form__field">
            <span>สาขา</span>
            <select
              value={arrivalBranch}
              onChange={(event) => setArrivalBranch(event.target.value)}
            >
              <option value="">—</option>
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-arrival-form__field admin-arrival-form__field--wide">
            <span>เวลามางาน (ถ้ามี)</span>
            <input
              type="text"
              value={arrivalTime}
              onChange={(event) => setArrivalTime(event.target.value)}
              placeholder="เช่น 17:45 น."
            />
          </label>
          <div className="admin-arrival-form__actions">
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={savingArrival}
            >
              {savingArrival ? 'กำลังบันทึก...' : 'บันทึกผู้มางานคนแรก'}
            </button>
            {arrivalSaved && (
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={handleClearArrivalPrize}
                disabled={savingArrival}
              >
                ล้าง
              </button>
            )}
          </div>
        </form>
        </AdminPrizePanel>

        <AdminPrizePanel
          label="รางวัลอาจารย์มางานคนแรก"
          hint="กรอกชื่อเมื่อรู้อาจารย์มางานคนแรกแล้ว — ปุ่ม MC「รางวัลพิเศษ สำหรับอาจารย์คนแรก」"
          savedName={teacherSaved?.displayName}
          open={teacherPanelOpen}
          onToggle={() => setTeacherPanelOpen((current) => !current)}
          variant="teacher"
        >
        <form className="admin-arrival-form" onSubmit={handleSaveTeacherPrize}>
          <label className="admin-arrival-form__field admin-arrival-form__field--wide">
            <span>ชื่ออาจารย์</span>
            <input
              type="text"
              value={teacherName}
              onChange={(event) => setTeacherName(event.target.value)}
              placeholder="เช่น ผศ. ดร.ภูริพันธุ์ รุจิขจร"
              required
            />
          </label>
          <label className="admin-arrival-form__field admin-arrival-form__field--wide">
            <span>ตำแหน่ง/คำนำหน้า (ถ้ามี)</span>
            <input
              type="text"
              value={teacherTitle}
              onChange={(event) => setTeacherTitle(event.target.value)}
              placeholder="เช่น รศ. ดร."
            />
          </label>
          <label className="admin-arrival-form__field admin-arrival-form__field--wide">
            <span>เวลามางาน (ถ้ามี)</span>
            <input
              type="text"
              value={teacherTime}
              onChange={(event) => setTeacherTime(event.target.value)}
              placeholder="เช่น 17:30 น."
            />
          </label>
          <div className="admin-arrival-form__actions">
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={savingTeacher}
            >
              {savingTeacher ? 'กำลังบันทึก...' : 'บันทึกอาจารย์มางานคนแรก'}
            </button>
            {teacherSaved && (
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={handleClearTeacherPrize}
                disabled={savingTeacher}
              >
                ล้าง
              </button>
            )}
          </div>
        </form>
        </AdminPrizePanel>
      </section>

      <div className="admin-toolbar">
        <label className="admin-filter">
          <span>กรองเกม/ข้อ</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">ทั้งหมด</option>
            {QUESTION_OPTIONS.map((option) => (
              <option
                key={getQuestionValue(option.gameType, option.questionKey)}
                value={getQuestionValue(option.gameType, option.questionKey)}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="admin-count">แสดง {rankedRows.length} รายการ</p>
      </div>

      {activeQuestion && (
        <div className="admin-reveal-panel">
          <div>
            <p className="admin-reveal-panel__label">
              ผู้ชนะบนเวที — ปุ่ม「คนตอบถูกเร็วที่สุด」
            </p>
            <p className="admin-reveal-panel__value">{formatWinnerLabel(winnerSelection)}</p>
            {winnerSelection?.answerText && (
              <p className="admin-reveal-panel__meta">
                คำตอบ: {winnerSelection.answerText}
              </p>
            )}
          </div>
          {winnerSelection && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={handleClearWinner}
            >
              ล้างผู้ชนะ
            </button>
          )}
        </div>
      )}

      {errorMessage && <p className="admin-error">{errorMessage}</p>}
      {actionMessage && <p className="admin-success">{actionMessage}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>อันดับ</th>
              <th>ชื่อ</th>
              <th>สาขา</th>
              <th>เกม/ข้อ</th>
              <th>คำตอบ</th>
              <th>ถูก/ผิด</th>
              <th>ผู้ชนะเวที</th>
              <th>เวลาส่ง</th>
            </tr>
          </thead>
          <tbody>
            {rankedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-table__empty">
                  {loading ? 'กำลังโหลด...' : 'ยังไม่มีคำตอบ'}
                </td>
              </tr>
            ) : (
              rankedRows.map((row, index) => {
                const pickedAsWinner = isWinnerRow(row)

                return (
                  <tr
                    key={row.id}
                    className={`${
                      row.is_correct ? 'admin-table__row--correct' : 'admin-table__row--wrong'
                    } ${pickedAsWinner ? 'admin-table__row--picked' : ''}`}
                  >
                    <td>{index + 1}</td>
                    <td>{row.player_name}</td>
                    <td>{row.branch || '—'}</td>
                    <td>{getQuestionLabel(row.game_type, row.question_key)}</td>
                    <td>{row.answer_text}</td>
                    <td>
                      <span
                        className={`admin-pill ${
                          row.is_correct ? 'admin-pill--correct' : 'admin-pill--wrong'
                        }`}
                      >
                        {row.is_correct ? 'ถูก' : 'ผิด'}
                      </span>
                    </td>
                    <td>
                      {pickedAsWinner ? (
                        <span className="admin-pill admin-pill--picked">ผู้ชนะ</span>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--pick"
                          onClick={() => handlePickWinner(row)}
                          disabled={savingWinnerId === row.id}
                        >
                          {savingWinnerId === row.id ? 'กำลังบันทึก...' : 'เลือกเป็นผู้ชนะ'}
                        </button>
                      )}
                    </td>
                    <td>{formatDateTime(row.submitted_at)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
