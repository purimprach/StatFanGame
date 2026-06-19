export default function RevealOverlay({ label, text, buildingStatus = 'กำลังเฉลย...', visible }) {
  return (
    <div className="answer-overlay" role="status" aria-live="polite">
      <div
        className={`answer-reveal ${
          visible ? 'answer-reveal--shown' : 'answer-reveal--building'
        }`}
      >
        {visible ? (
          <>
            <span className="answer-reveal__label">{label}</span>
            <span className="answer-reveal__text">{text}</span>
          </>
        ) : (
          <>
            <div className="answer-buildup" aria-hidden="true">
              <span className="answer-buildup__ring" />
              <span className="answer-buildup__ring answer-buildup__ring--delay" />
              <span className="answer-buildup__core" />
            </div>
            <span className="answer-reveal__label">{label}</span>
            <span className="answer-buildup__status">{buildingStatus}</span>
          </>
        )}
      </div>
    </div>
  )
}
