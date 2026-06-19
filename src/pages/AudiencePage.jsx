import { useEffect, useState } from 'react'
import {
  fetchPlayerSubmission,
  submitAnswer,
  isUsingLocalDemo,
} from '../lib/answersApi'
import { getPlayerProfile, savePlayerProfile } from '../lib/playerStorage'
import { getSubmission, saveSubmission } from '../lib/playerSubmissions'
import {
  BRANCH_OPTIONS,
  getQuestionLabel,
  getQuestionValue,
  parseQuestionValue,
  QUESTION_OPTIONS,
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
  const [customBranch, setCustomBranch] = useState('')
  const [questionValue, setQuestionValue] = useState(
    getQuestionValue(QUESTION_OPTIONS[0].gameType, QUESTION_OPTIONS[0].questionKey),
  )
  const [answerText, setAnswerText] = useState('')
  const [submission, setSubmission] = useState(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { gameType, questionKey } = parseQuestionValue(questionValue)
  const isLocked = Boolean(submission) || status === 'submitted'

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setBranch(BRANCH_OPTIONS.includes(profile.branch) ? profile.branch : 'อื่นๆ')
      if (!BRANCH_OPTIONS.includes(profile.branch)) {
        setCustomBranch(profile.branch)
      }
    }
  }, [profile])

  useEffect(() => {
    setErrorMessage('')

    const localSubmission = getSubmission(gameType, questionKey)
    if (localSubmission) {
      setSubmission(localSubmission)
      setAnswerText(localSubmission.answerText)
      setStatus('submitted')
      return undefined
    }

    if (!profile) {
      setSubmission(null)
      setAnswerText('')
      setStatus('idle')
      return undefined
    }

    let cancelled = false
    setStatus('loading')

    fetchPlayerSubmission({
      playerName: profile.name,
      gameType,
      questionKey,
    })
      .then((remoteSubmission) => {
        if (cancelled) {
          return
        }

        if (remoteSubmission) {
          const saved = saveSubmission({
            gameType,
            questionKey,
            answerText: remoteSubmission.answerText,
            submittedAt: remoteSubmission.submittedAt,
          })
          setSubmission(saved)
          setAnswerText(saved.answerText)
          setStatus('submitted')
          return
        }

        setSubmission(null)
        setAnswerText('')
        setStatus('idle')
      })
      .catch(() => {
        if (!cancelled) {
          setSubmission(null)
          setAnswerText('')
          setStatus('idle')
        }
      })

    return () => {
      cancelled = true
    }
  }, [profile, gameType, questionKey])

  const resolvedBranch = branch === 'อื่นๆ' ? customBranch.trim() : branch

  const handleSaveProfile = (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrorMessage('กรุณากรอกชื่อเล่น')
      return
    }
    if (branch === 'อื่นๆ' && !customBranch.trim()) {
      setErrorMessage('กรุณากรอกสาขา')
      return
    }

    const saved = savePlayerProfile({ name: trimmedName, branch: resolvedBranch })
    setProfile(saved)
    setErrorMessage('')
    setStatus('idle')
  }

  const handleSubmitAnswer = async (event) => {
    event.preventDefault()

    if (isLocked) {
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
      setSubmission(saved)
      setStatus('submitted')
    } catch (error) {
      setStatus('idle')
      setErrorMessage(error.message ?? 'ส่งคำตอบไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
  }

  const handleEditProfile = () => {
    setProfile(null)
    setSubmission(null)
    setStatus('idle')
    setErrorMessage('')
  }

  const demoMode = isUsingLocalDemo()

  return (
    <div className="audience-page">
      {demoMode && (
        <p className="audience-demo-banner">
          โหมดทดสอบ — ยังไม่มี Supabase คำตอบเก็บในเครื่องนี้เท่านั้น
        </p>
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

          {branch === 'อื่นๆ' && (
            <label className="audience-field">
              <span>ระบุสาขา</span>
              <input
                type="text"
                value={customBranch}
                onChange={(e) => setCustomBranch(e.target.value)}
                placeholder="พิมพ์สาขาของคุณ"
                maxLength={40}
              />
            </label>
          )}

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
            <label className="audience-field">
              <span>เกม / ข้อ</span>
              <select
                value={questionValue}
                onChange={(e) => setQuestionValue(e.target.value)}
                disabled={status === 'loading'}
              >
                {QUESTION_OPTIONS.map((option) => (
                  <option
                    key={getQuestionValue(option.gameType, option.questionKey)}
                    value={getQuestionValue(option.gameType, option.questionKey)}
                  >
                    {option.label}
                    {getSubmission(option.gameType, option.questionKey) ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="audience-field">
              <span>คำตอบของคุณ</span>
              <input
                type="text"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="พิมพ์คำตอบตามที่เห็นบนเวที"
                autoComplete="off"
                maxLength={200}
                readOnly={isLocked}
                disabled={status === 'loading'}
                className={isLocked ? 'audience-input--locked' : undefined}
              />
            </label>

            {errorMessage && <p className="audience-error">{errorMessage}</p>}

            {submission && (
              <div className="audience-submitted">
                <p className="audience-success" role="status">
                  ส่งคำตอบ {getQuestionLabel(gameType, questionKey)} แล้ว
                </p>
                <dl className="audience-submitted__meta">
                  <div>
                    <dt>คำตอบที่บันทึก</dt>
                    <dd>{submission.answerText}</dd>
                  </div>
                  <div>
                    <dt>เวลาส่ง</dt>
                    <dd>{formatDateTime(submission.submittedAt)}</dd>
                  </div>
                </dl>
              </div>
            )}

            <button
              type="submit"
              className="audience-btn audience-btn--primary"
              disabled={isLocked || status === 'submitting' || status === 'loading'}
            >
              {status === 'submitting'
                ? 'กำลังส่ง...'
                : status === 'loading'
                  ? 'กำลังโหลด...'
                  : isLocked
                    ? 'ส่งแล้ว'
                    : 'ส่งคำตอบ'}
            </button>

            <p className="audience-note">
              ส่งได้ครั้งเดียวต่อข้อ — เลือกเกม/ข้ออื่นในรายการด้านบนเพื่อส่งคำตอบรอบถัดไป
            </p>
          </form>
        </>
      )}
    </div>
  )
}
