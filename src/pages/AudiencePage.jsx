import { useEffect, useState } from 'react'
import {
  fetchPlayerSubmissions,
  MAX_ANSWER_ATTEMPTS,
  submitAnswer,
  isUsingLocalDemo,
} from '../lib/answersApi'
import { getPlayerProfile, savePlayerProfile } from '../lib/playerStorage'
import { getSubmissions, saveSubmission, syncSubmissions } from '../lib/playerSubmissions'
import { useSyncedActiveQuestion } from '../hooks/useSyncedActiveQuestion'
import {
  BRANCH_OPTIONS,
  getQuestionLabel,
  getQuestionValue,
  normalizeBranch,
  parseQuestionValue,
} from '../data/questions'
import './AudiencePage.css'

function formatDateTime(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

export default function AudiencePage() {
  const [profile, setProfile] = useState(() => getPlayerProfile())
  const [name, setName] = useState('')
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0])
  const [questionValue, setQuestionValue] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { activeQuestion, ready, syncAvailable } = useSyncedActiveQuestion()

  const { gameType, questionKey } = parseQuestionValue(questionValue || 'unknown:unknown')
  const hasActiveQuestion = Boolean(activeQuestion?.gameType && activeQuestion?.questionKey)
  const submissionCount = submissions.length
  const remainingAttempts = Math.max(0, MAX_ANSWER_ATTEMPTS - submissionCount)
  const isLocked = submissionCount >= MAX_ANSWER_ATTEMPTS

  useEffect(() => {
    if (activeQuestion?.gameType && activeQuestion?.questionKey) {
      setQuestionValue(
        getQuestionValue(activeQuestion.gameType, activeQuestion.questionKey),
      )
    } else {
      setQuestionValue('')
    }
  }, [activeQuestion])

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setBranch(normalizeBranch(profile.branch))
    }
  }, [profile])

  useEffect(() => {
    if (!hasActiveQuestion) {
      setSubmissions([])
      setAnswerText('')
      setStatus('idle')
      setErrorMessage('')
      return undefined
    }

    setErrorMessage('')

    const localSubmissions = getSubmissions(gameType, questionKey)

    if (!profile) {
      setSubmissions(localSubmissions)
      setAnswerText('')
      setStatus('idle')
      return undefined
    }

    let cancelled = false
    setStatus('loading')

    fetchPlayerSubmissions({
      playerName: profile.name,
      gameType,
      questionKey,
    })
      .then((remoteSubmissions) => {
        if (cancelled) {
          return
        }

        const merged =
          remoteSubmissions.length > 0
            ? syncSubmissions(gameType, questionKey, remoteSubmissions)
            : localSubmissions

        setSubmissions(merged)
        setAnswerText('')
        setStatus(merged.length >= MAX_ANSWER_ATTEMPTS ? 'done' : 'idle')
      })
      .catch(() => {
        if (!cancelled) {
          setSubmissions(localSubmissions)
          setAnswerText('')
          setStatus(localSubmissions.length >= MAX_ANSWER_ATTEMPTS ? 'done' : 'idle')
        }
      })

    return () => {
      cancelled = true
    }
  }, [profile, gameType, questionKey, hasActiveQuestion])

  const handleSaveProfile = (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrorMessage('กรุณากรอกชื่อเล่น')
      return
    }

    const saved = savePlayerProfile({ name: trimmedName, branch })
    setProfile(saved)
    setErrorMessage('')
    setStatus('idle')
  }

  const handleSubmitAnswer = async (event) => {
    event.preventDefault()

    if (!hasActiveQuestion || isLocked) {
      return
    }

    const trimmedAnswer = answerText.trim()
    if (!trimmedAnswer) {
      setErrorMessage('กรุณากรอกคำตอบ')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const result = await submitAnswer({
        playerName: profile.name,
        branch: profile.branch,
        gameType,
        questionKey,
        answerText: trimmedAnswer,
      })

      const saved = saveSubmission({
        gameType,
        questionKey,
        answerText: trimmedAnswer,
        submittedAt: result.submittedAt,
      })
      const updated = [saved, ...submissions].sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
      )
      setSubmissions(updated)
      setAnswerText('')
      setStatus(updated.length >= MAX_ANSWER_ATTEMPTS ? 'done' : 'idle')
    } catch (error) {
      setStatus('idle')
      setErrorMessage(error.message ?? 'ส่งคำตอบไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
  }

  const handleEditProfile = () => {
    setProfile(null)
    setSubmissions([])
    setStatus('idle')
    setErrorMessage('')
  }

  const demoMode = isUsingLocalDemo()

  return (
    <div className="audience-page">
      {demoMode && (
        <div className="audience-demo-banner audience-demo-banner--critical">
          <p className="audience-demo-banner__title">มือถือยังเชื่อมจอเวทีไม่ได้</p>
          <p>
            ต้องตั้ง <strong>Supabase</strong> บน Vercel ก่อน (ประมาณ 10 นาที)
            — ตอนนี้ใช้ได้แค่ทดสอบ 2 แท็บในเบราว์เซอร์เครื่องเดียวกัน
          </p>
        </div>
      )}
      {!demoMode && syncAvailable && (
        <p className="audience-sync-banner">เชื่อมกับจอเวทีแล้ว — ข้อจะเปลี่ยนตามเกมที่ MC เปิด</p>
      )}
      <header className="audience-header">
        <p className="audience-badge">STAT#55 · Audience Answer</p>
        <h1>ส่งคำตอบ</h1>
        <p className="audience-subtitle">ดูคำถามจากจอเวที แล้วส่งคำตอบที่นี่</p>
      </header>

      {!profile ? (
        <form className="audience-card" onSubmit={handleSaveProfile}>
          <h2>ลงทะเบียนก่อนส่งคำตอบ</h2>

          <label className="audience-field">
            <span>ชื่อเล่น</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ก้อย, ต้าไห่"
              autoComplete="nickname"
              maxLength={60}
            />
          </label>

          <label className="audience-field">
            <span>สาขา</span>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {errorMessage && <p className="audience-error">{errorMessage}</p>}

          <button type="submit" className="audience-btn audience-btn--primary">
            เริ่มส่งคำตอบ
          </button>
        </form>
      ) : (
        <>
          <div className="audience-profile">
            <div>
              <p className="audience-profile__label">ผู้เล่น</p>
              <p className="audience-profile__value">
                {profile.name} · {profile.branch}
              </p>
            </div>
            <button
              type="button"
              className="audience-btn audience-btn--ghost"
              onClick={handleEditProfile}
            >
              แก้ไข
            </button>
          </div>

          <form className="audience-card" onSubmit={handleSubmitAnswer}>
            {!ready ? (
              <p className="audience-waiting">กำลังเชื่อมกับจอเวที...</p>
            ) : hasActiveQuestion ? (
              <div className="audience-live-question">
                <span className="audience-live-question__label">เกมปัจจุบัน (ตามจอเวที)</span>
                <strong className="audience-live-question__value">
                  {activeQuestion.label ||
                    getQuestionLabel(activeQuestion.gameType, activeQuestion.questionKey)}
                </strong>
              </div>
            ) : (
              <div className="audience-waiting audience-waiting--card">
                <p className="audience-waiting__title">รอ MC กดเริ่มเกมบนเวที</p>
                <p className="audience-waiting__text">
                  เมื่อ MC กด「เริ่มเกม」ข้อนี้จะเปิดให้ส่งคำตอบอัตโนมัติ
                </p>
              </div>
            )}

            <label className="audience-field">
              <span>คำตอบของคุณ</span>
              <input
                type="text"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={
                  hasActiveQuestion
                    ? 'พิมพ์คำตอบตามที่เห็นบนเวที'
                    : 'รอ MC เปิดเกมก่อน'
                }
                autoComplete="off"
                maxLength={200}
                readOnly={isLocked}
                disabled={!hasActiveQuestion || status === 'loading'}
                className={isLocked ? 'audience-input--locked' : undefined}
              />
            </label>

            {errorMessage && <p className="audience-error">{errorMessage}</p>}

            {submissions.length > 0 && (
              <div className="audience-submitted">
                <p className="audience-success" role="status">
                  ส่งแล้ว {submissionCount}/{MAX_ANSWER_ATTEMPTS} ครั้ง
                </p>
                <dl className="audience-submitted__meta">
                  {[...submissions].reverse().map((entry, index) => (
                    <div key={`${entry.submittedAt}-${index}`}>
                      <dt>ครั้งที่ {index + 1}</dt>
                      <dd>
                        {entry.answerText}
                        <span className="audience-submitted__time">
                          {' '}
                          · {formatDateTime(entry.submittedAt)}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <button
              type="submit"
              className="audience-btn audience-btn--primary"
              disabled={
                !hasActiveQuestion ||
                isLocked ||
                status === 'submitting' ||
                status === 'loading'
              }
            >
              {status === 'submitting'
                ? 'กำลังส่ง...'
                : status === 'loading'
                  ? 'กำลังโหลด...'
                  : isLocked
                    ? 'ส่งครบแล้ว'
                    : remainingAttempts < MAX_ANSWER_ATTEMPTS
                      ? `ส่งคำตอบ (เหลือ ${remainingAttempts} ครั้ง)`
                      : 'ส่งคำตอบ'}
            </button>

            <p className="audience-note">
              ส่งได้ {MAX_ANSWER_ATTEMPTS} ครั้งต่อข้อ — เมื่อ MC เปิดรอบใหม่บนเวที ข้อจะเปลี่ยนให้อัตโนมัติ
            </p>
          </form>
        </>
      )}
    </div>
  )
}
