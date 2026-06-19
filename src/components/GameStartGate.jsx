export default function GameStartGate({ started, onStart, children }) {
  return (
    <div className={`game-start-gate ${started ? 'game-start-gate--started' : ''}`}>
      {children}
      {!started && (
        <div className="game-start-gate__overlay">
          <div className="game-start-gate__panel">
            <p className="game-start-gate__label">พร้อมเริ่มรอบนี้แล้วหรือยัง?</p>
            <button
              type="button"
              className="hint-btn hint-btn--gold game-start-gate__btn"
              onClick={onStart}
            >
              เริ่มเกม
            </button>
            <p className="game-start-gate__hint">
              กดเริ่มเกมเพื่อเปิดรับคำตอบจากผู้ชมบนมือถือ
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
