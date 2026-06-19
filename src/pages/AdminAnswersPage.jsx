import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearAllAnswers,
  fetchAllAnswers,
  isUsingLocalDemo,
  sortAnswers,
} from '../lib/answersApi'
import {
  getQuestionLabel,
  getQuestionValue,
  QUESTION_OPTIONS,
} from '../data/questions'
import './AdminAnswersPage.css'

function formatDateTime(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

export default function AdminAnswersPage() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')

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
      setActionMessage('ล้างคำตอบทั้งหมดแล้ว')
    } catch (error) {
      setErrorMessage(error.message ?? 'ล้างข้อมูลไม่สำเร็จ')
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
          <p className="admin-subtitle">เรียงถูกก่อน · ส่งเร็วก่อน · ผิดอยู่ล่าง</p>
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
              <th>เวลาส่ง</th>
            </tr>
          </thead>
          <tbody>
            {rankedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table__empty">
                  {loading ? 'กำลังโหลด...' : 'ยังไม่มีคำตอบ'}
                </td>
              </tr>
            ) : (
              rankedRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={row.is_correct ? 'admin-table__row--correct' : 'admin-table__row--wrong'}
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
                  <td>{formatDateTime(row.submitted_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
