import { REGISTRATION_TEACHER_COUNT, REGISTRATION_TEACHER_LISTS } from '../data/teacherRegistrationLists'
import './TeacherSignInSheetPage.css'

const SITE_URL = 'https://stat-fan-game.vercel.app'

export default function TeacherSignInSheetPage() {
  return (
    <div className="teacher-signin">
      <header className="teacher-signin__header">
        <p className="teacher-signin__badge">STAT#55 · Bye Nior Game Show 2026</p>
        <h1>ใบลงชื่ออาจารย์</h1>
        <p className="teacher-signin__subtitle">
          สำหรับอาจารย์คณะสถิติ — กรุณาเซ็นชื่อเมื่อเข้าร่วมงาน
        </p>
        <div className="teacher-signin__meta">
          <p>
            <span>วันที่</span>
            <span className="teacher-signin__line" aria-hidden="true" />
          </p>
          <p>
            <span>สถานที่</span>
            <span className="teacher-signin__line teacher-signin__line--wide" aria-hidden="true" />
          </p>
        </div>
        <button type="button" className="teacher-signin__print" onClick={() => window.print()}>
          พิมพ์ใบนี้
        </button>
      </header>

      <table className="teacher-signin__table">
        <thead>
          <tr>
            <th className="teacher-signin__col-no">ลำดับ</th>
            <th className="teacher-signin__col-name">ชื่อ-นามสกุล</th>
            <th className="teacher-signin__col-sign">ลายเซ็น</th>
            <th className="teacher-signin__col-note">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {REGISTRATION_TEACHER_LISTS.map((name, index) => (
            <tr key={name}>
              <td>{index + 1}</td>
              <td>{name}</td>
              <td aria-label={`ลายเซ็น ${name}`} />
              <td aria-label={`หมายเหตุ ${name}`} />
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="teacher-signin__footer">
        <p>
          รวม {REGISTRATION_TEACHER_COUNT} ท่าน · พิมพ์จาก {SITE_URL}/teacher-signin
        </p>
        <p className="teacher-signin__footer-note">
          ผู้จัดงาน: กรอกวันที่และสถานที่ก่อนพิมพ์ (ถ้าต้องการ)
        </p>
      </footer>
    </div>
  )
}
