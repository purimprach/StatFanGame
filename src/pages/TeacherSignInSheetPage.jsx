import { useEffect, useMemo, useState } from 'react'
import { REGISTRATION_TEACHER_COUNT, REGISTRATION_TEACHER_LISTS } from '../data/teacherRegistrationLists'
import './TeacherSignInSheetPage.css'

const STORAGE_KEY = 'stat55_teacher_attendance'
const EVENT_DATE = '20 มิถุนายน พ.ศ. 2569'
const EVENT_VENUE = 'โรงแรม Inter Continental Bangkok'

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { attendance: {}, updatedAt: null }
    }

    const parsed = JSON.parse(raw)
    return {
      attendance: parsed.attendance ?? {},
      updatedAt: parsed.updatedAt ?? null,
    }
  } catch {
    return { attendance: {}, updatedAt: null }
  }
}

function saveState(attendance) {
  const payload = {
    attendance,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload.updatedAt
}

function formatSavedTime(value) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function TeacherSignInSheetPage() {
  const [attendance, setAttendance] = useState(() => loadSavedState().attendance)
  const [savedAt, setSavedAt] = useState(() => loadSavedState().updatedAt)

  useEffect(() => {
    const saved = loadSavedState()
    setAttendance(saved.attendance)
    setSavedAt(saved.updatedAt)
  }, [])

  const summary = useMemo(() => {
    let present = 0
    let absent = 0

    for (const name of REGISTRATION_TEACHER_LISTS) {
      if (attendance[name] === 'present') {
        present += 1
      } else if (attendance[name] === 'absent') {
        absent += 1
      }
    }

    return {
      present,
      absent,
      pending: REGISTRATION_TEACHER_COUNT - present - absent,
    }
  }, [attendance])

  const setStatus = (name, status) => {
    setAttendance((current) => {
      const next = { ...current }
      if (next[name] === status) {
        delete next[name]
      } else {
        next[name] = status
      }

      setSavedAt(saveState(next))
      return next
    })
  }

  const handleReset = () => {
    const confirmed = window.confirm('ล้างการติ๊กทั้งหมด?')
    if (!confirmed) {
      return
    }

    setAttendance({})
    setSavedAt(saveState({}))
  }

  return (
    <div className="teacher-signin">
      <header className="teacher-signin__header">
        <p className="teacher-signin__badge">STAT#55 · Bye Nior Game Show 2026</p>
        <h1>ใบลงชื่ออาจารย์</h1>
        <p className="teacher-signin__subtitle">
          แตะช่อง <strong>มา</strong> / <strong>ไม่มา</strong> บน iPad ได้ — หรือพิมพ์แล้วให้เซ็นชื่อในช่องลายเซ็น
        </p>

        <div className="teacher-signin__meta">
          <p>
            <span>วันที่</span>
            <strong>{EVENT_DATE}</strong>
          </p>
          <p>
            <span>สถานที่</span>
            <strong>{EVENT_VENUE}</strong>
          </p>
        </div>

        <div className="teacher-signin__summary teacher-signin__no-print" aria-live="polite">
          <span className="teacher-signin__summary-item teacher-signin__summary-item--present">
            มา {summary.present}
          </span>
          <span className="teacher-signin__summary-item teacher-signin__summary-item--absent">
            ไม่มา {summary.absent}
          </span>
          <span className="teacher-signin__summary-item teacher-signin__summary-item--pending">
            ยังไม่ติ๊ก {summary.pending}
          </span>
          <span className="teacher-signin__summary-item">รวม {REGISTRATION_TEACHER_COUNT}</span>
        </div>

        <div className="teacher-signin__actions teacher-signin__no-print">
          <button
            type="button"
            className="teacher-signin__reset"
            onClick={handleReset}
            data-ui-click="off"
          >
            ล้างการติ๊ก
          </button>
          <button type="button" className="teacher-signin__print" onClick={() => window.print()}>
            พิมพ์ใบนี้
          </button>
        </div>

        {savedAt && (
          <p className="teacher-signin__saved teacher-signin__no-print">
            บันทึกล่าสุด: {formatSavedTime(savedAt)}
          </p>
        )}
      </header>

      <div className="teacher-signin__table-wrap">
        <table className="teacher-signin__table">
          <thead>
            <tr>
              <th className="teacher-signin__col-no">ลำดับ</th>
              <th className="teacher-signin__col-name">ชื่อ-นามสกุล</th>
              <th className="teacher-signin__col-tick">มา</th>
              <th className="teacher-signin__col-tick">ไม่มา</th>
              <th className="teacher-signin__col-sign">ลายเซ็น</th>
              <th className="teacher-signin__col-note">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {REGISTRATION_TEACHER_LISTS.map((name, index) => {
              const status = attendance[name]
              const isPresent = status === 'present'
              const isAbsent = status === 'absent'

              return (
                <tr
                  key={name}
                  className={
                    isPresent
                      ? 'teacher-signin__row--present'
                      : isAbsent
                        ? 'teacher-signin__row--absent'
                        : undefined
                  }
                >
                  <td>{index + 1}</td>
                  <td className="teacher-signin__name-cell">{name}</td>
                  <td className="teacher-signin__tick-cell">
                    <button
                      type="button"
                      className={`teacher-signin__tick teacher-signin__tick--present ${
                        isPresent ? 'teacher-signin__tick--active' : ''
                      }`}
                      onClick={() => setStatus(name, 'present')}
                      aria-pressed={isPresent}
                      aria-label={`${name} — มา`}
                      data-ui-click="off"
                    >
                      {isPresent ? '✓' : ''}
                    </button>
                  </td>
                  <td className="teacher-signin__tick-cell">
                    <button
                      type="button"
                      className={`teacher-signin__tick teacher-signin__tick--absent ${
                        isAbsent ? 'teacher-signin__tick--active' : ''
                      }`}
                      onClick={() => setStatus(name, 'absent')}
                      aria-pressed={isAbsent}
                      aria-label={`${name} — ไม่มา`}
                      data-ui-click="off"
                    >
                      {isAbsent ? '✓' : ''}
                    </button>
                  </td>
                  <td className="teacher-signin__sign-cell" aria-label={`ลายเซ็น ${name}`} />
                  <td className="teacher-signin__note-cell" aria-label={`หมายเหตุ ${name}`} />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="teacher-signin__footer">
        <p className="teacher-signin__no-print">
          รวม {REGISTRATION_TEACHER_COUNT} ท่าน · แตะซ้ำที่ช่องเดิมเพื่อยกเลิกการติ๊ก
        </p>
        <p className="teacher-signin__print-only">
          รวม {REGISTRATION_TEACHER_COUNT} ท่าน · {EVENT_DATE} · {EVENT_VENUE}
        </p>
      </footer>
    </div>
  )
}
