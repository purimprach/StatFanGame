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

      <section className="staff-sheet__section staff-sheet__section--prize">
        <h2>รางวัลมางานคนแรก (กรอกวันงาน)</h2>
        <p className="staff-sheet__prize-intro">
          วันงานให้ <strong>แอดมิน</strong> เปิด{' '}
          <strong>/admin-answers</strong> → กรอกชื่อในช่อง「รางวัลมางานคนแรก」→
          กดบันทึก → <strong>MC</strong> กดปุ่ม「รางวัลพิเศษ สำหรับคนที่มางานคนแรก」บนหน้าแรก
        </p>
      </section>

      <section className="staff-sheet__section staff-sheet__section--prize">
        <h2>รางวัลลงทะเบียนฟอร์มคนสุดท้าย</h2>
        <p className="staff-sheet__prize-intro">
          <strong>ขั้นที่ 1:</strong> กดปุ่มบนหน้าแรก → ขึ้น <strong>นาย รักษ์พันธ์ มีมาก</strong>{' '}
          (กรอกล่างสุด 11 มิ.ย. 0:00:49 น.) + ข้อความ「ไม่ได้รับรางวัล — เกินเวลา」
          <br />
          <strong>ขั้นที่ 2:</strong> กด <strong>「ประมวลผลใหม่」</strong> → ขึ้น{' '}
          <strong>นาย ชิษณุพงศ์ เกียรติเพชรรัตน์</strong> (ผู้ได้รางวัลจริง)
        </p>
        <div className="staff-sheet__winner-card">
          <p className="staff-sheet__winner-label">ขั้นที่ 1 · กรอกล่างสุด (ไม่ได้รางวัล)</p>
          <p className="staff-sheet__winner-name">นาย รักษ์พันธ์ มีมาก</p>
          <table className="staff-sheet__table staff-sheet__table--winner">
            <tbody>
              <tr>
                <th>เวลาลงทะเบียน</th>
                <td>11 มิถุนายน 2569 · 0:00:49 น.</td>
              </tr>
              <tr>
                <th>รหัสนิสิต</th>
                <td>6542101726</td>
              </tr>
              <tr>
                <th>สาขา</th>
                <td>INS</td>
              </tr>
              <tr>
                <th>สถานะ</th>
                <td>ไม่ได้รับรางวัล — เกินเวลาปิดรับ</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="staff-sheet__winner-card">
          <p className="staff-sheet__winner-label">ขั้นที่ 2 · ผู้ได้รางวัล (หลังประมวลผลใหม่)</p>
          <p className="staff-sheet__winner-name">นาย ชิษณุพงศ์ เกียรติเพชรรัตน์</p>
          <table className="staff-sheet__table staff-sheet__table--winner">
            <tbody>
              <tr>
                <th>เวลาลงทะเบียน</th>
                <td>10 มิถุนายน 2569 · 22:40:01 น.</td>
              </tr>
              <tr>
                <th>รหัสนิสิต</th>
                <td>6542027026</td>
              </tr>
              <tr>
                <th>สาขา</th>
                <td>INS</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="staff-sheet__mc-script">
          <strong>สคริปต์ MC:</strong> 「ผู้กรอกฟอร์มคนสุดท้ายคือ นาย รักษ์พันธ์ มีมาก
          แต่กรอกหลังเวลาปิดรับ ไม่ได้รางวัล — กดประมวลผลใหม่...
          ขอแสดงความยินดีกับ นาย ชิษณุพงศ์ เกียรติเพชรรัตน์ รหัส 6542027026 สาขา INS
          ผู้กรอกฟอร์มคนสุดท้ายที่อยู่ในเวลา ได้รับรางวัล!」
        </p>
      </section>

      <section className="staff-sheet__section staff-sheet__section--prize">
        <h2>รางวัลลงทะเบียนฟอร์มคนแรก</h2>
        <p className="staff-sheet__prize-intro">
          แอดมินประกาศเปิดรับลงทะเบียน <strong>9 มิถุนายน 2569 เวลา 18:12 น.</strong>{' '}
          ผู้ลงทะเบียนคนแรกเวลา <strong>18:14 น.</strong> — ให้ MC ประกาศมอบรางวัลคนนี้
        </p>
        <div className="staff-sheet__winner-card">
          <p className="staff-sheet__winner-label">ผู้ชนะ · ลงทะเบียนคนแรก</p>
          <p className="staff-sheet__winner-name">นางสาว วรรณกมล สนิทวงศ์ ณ อยุธยา</p>
          <table className="staff-sheet__table staff-sheet__table--winner">
            <tbody>
              <tr>
                <th>เวลาลงทะเบียน</th>
                <td>9 มิถุนายน 2569 · 18:14:23 น.</td>
              </tr>
              <tr>
                <th>รหัสนิสิต</th>
                <td>6542105226</td>
              </tr>
              <tr>
                <th>สาขา</th>
                <td>BIT</td>
              </tr>
              <tr>
                <th>ยืนยันเข้าร่วม</th>
                <td>ไป</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="staff-sheet__mc-script">
          <strong>สคริปต์ MC:</strong> 「ขอแสดงความยินดีกับ นางสาว วรรณกมล สนิทวงศ์ ณ อยุธยา
          รหัส 6542105226 สาขา BIT ผู้ลงทะเบียนฟอร์ม STAT#55 คนแรกหลังประกาศ 18:12 น.
          ได้รับรางวัล!」
        </p>
      </section>

      <footer className="staff-sheet__footer">
        <p>STAT#55 Bye Nior Game Show 2026 — ผู้สร้างเกม: พิมพ์เอกสารนี้ให้ทีมรันเท่านั้น</p>
      </footer>
    </div>
  )
}
