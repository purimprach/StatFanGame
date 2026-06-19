import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearAllAnswers,
  fetchAllAnswers,
  isUsingLocalDemo,
  sortAnswers,
} from '../lib/answersApi'
import {
  clearWinnerSelection,
  setWinnerSelection,
  subscribeWinnerSelection,
} from '../lib/winnerSelection'
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
      await setWinnerSelection({
        gameType: row.game_type,
        questionKey: row.question_key,
        playerName: row.player_name,
        branch: row.branch,
        answerText: row.answer_text,
        sourceAnswerId: row.id,
      })
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
