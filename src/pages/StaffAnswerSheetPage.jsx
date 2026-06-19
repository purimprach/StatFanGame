import { hintCategories } from '../data/hintGameData'
import { puzzleCategories } from '../data/puzzleGameData'
import { ANSWER_KEY } from '../data/answerKey'
import './StaffAnswerSheetPage.css'

const SITE_URL = 'https://stat-fan-game.vercel.app'

export default function StaffAnswerSheetPage() {
  return (
    <div className="staff-sheet">
      <header className="staff-sheet__header">
        <p className="staff-sheet__badge">STAT#55 · เอกสารทีมงาน (ห้ามแจกผู้เล่น)</p>
        <h1>เฉลยคำตอบ + วิธีรันเกม</h1>
        <p className="staff-sheet__subtitle">
          สำหรับ MC / แอดมิน — พิมพ์หน้านี้ไปวางข้างจอ
        </p>
        <button type="button" className="staff-sheet__print" onClick={() => window.print()}>
          พิมพ์หน้านี้
        </button>
      </header>

      <section className="staff-sheet__section">
        <h2>ลิงก์สำคัญ</h2>
        <table className="staff-sheet__table">
          <tbody>
            <tr>
              <th>MC / จอเวที</th>
              <td>{SITE_URL}</td>
            </tr>
            <tr>
              <th>มือถือผู้เล่น</th>
              <td>{SITE_URL}/audience</td>
            </tr>
            <tr>
              <th>แอดมินดูคำตอบ</th>
              <td>{SITE_URL}/admin-answers</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="staff-sheet__section">
        <h2>ขั้นตอนรัน (จิ๊กซอว์ / คำใบ้)</h2>
        <ol className="staff-sheet__steps">
          <li>
            <strong>MC</strong> เลือกเกม/ข้อ → กด <strong>「เริ่มเกม」</strong> (รอข้อความ
            「เปิดรับคำตอบจากมือถือแล้ว」)
          </li>
          <li>
            <strong>ผู้เล่น</strong> ส่งคำตอบที่มือถือ (ส่งได้ <strong>2 ครั้ง</strong>/ข้อ)
          </li>
          <li>
            <strong>MC</strong> กด <strong>「เฉลยคำตอบ」</strong> → แสดงชื่อมาตรฐานด้านล่าง
          </li>
          <li>
            <strong>แอดมิน</strong> เปิด /admin-answers → กรองข้อ → ดูคำตอบเอง → กด{' '}
            <strong>「เลือกเป็นผู้ชนะ」</strong>
          </li>
          <li>
            <strong>MC</strong> กด <strong>「คนตอบถูกเร็วที่สุด」</strong> → แสดงชื่อที่แอดมินเลือก
          </li>
        </ol>
        <p className="staff-sheet__note">
          คอลัมน์「ถูก/ผิด」ในแอดมินใช้แค่ช่วยดู — <strong>ให้แอดมินตัดสินผู้ชนะเอง</strong>{' '}
          (สะกดผิด/ชื่อเล่นก็เลือกได้)
        </p>
      </section>

      <section className="staff-sheet__section">
        <h2>เกมจิ๊กซอว์</h2>
        <table className="staff-sheet__table staff-sheet__table--answers">
          <thead>
            <tr>
              <th>ข้อ</th>
              <th>คำเฉลยบนเวที (กดเฉลย)</th>
              <th>คำตอบมือถือที่รับได้</th>
            </tr>
          </thead>
          <tbody>
            {puzzleCategories.map((category) => (
              <tr key={category.id}>
                <td>ภาพ {category.name}</td>
                <td>
                  <strong>{category.answer}</strong>
                </td>
                <td>{ANSWER_KEY.jigsaw[category.name].join(' · ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="staff-sheet__section">
        <h2>เกมเปิดคำใบ้</h2>
        {hintCategories.map((category, index) => (
          <article key={category.id} className="staff-sheet__hint-block">
            <h3>
              {category.name}{' '}
              <span className="staff-sheet__hint-key">(key {index + 1})</span>
            </h3>
            <p>
              <strong>เฉลย:</strong> {category.answer}
            </p>
            <p>
              <strong>มือถือรับ:</strong>{' '}
              {ANSWER_KEY.hint[String(index + 1)].join(' · ')}
            </p>
            <p>
              <strong>คำใบ้:</strong> {category.hints.join(' → ')}
            </p>
          </article>
        ))}
      </section>

      <footer className="staff-sheet__footer">
        <p>STAT#55 Bye Nior Game Show 2026 — ผู้สร้างเกม: พิมพ์เอกสารนี้ให้ทีมรันเท่านั้น</p>
      </footer>
    </div>
  )
}
