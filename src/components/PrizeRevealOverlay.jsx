import RevealOverlay from './RevealOverlay'
import './PrizeRevealOverlay.css'

export default function PrizeRevealOverlay({
  prize,
  visible,
  contentVisible,
  onClose,
  advanceLabel,
  onAdvance,
}) {
  if (!prize) {
    return null
  }

  return (
    <div className="prize-reveal" role="dialog" aria-modal="true" aria-labelledby="prize-reveal-title">
      <button
        type="button"
        className="prize-reveal__backdrop"
        aria-label="ปิด"
        onClick={onClose}
      />
      <div className="prize-reveal__stage">
        <button type="button" className="prize-reveal__close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>
        <RevealOverlay
          label={prize.revealLabel}
          text={prize.displayName}
          buildingStatus={prize.buildingStatus ?? 'กำลังประกาศผู้ชนะ...'}
          visible={contentVisible}
        />
        {contentVisible && prize.isEmpty && (
          <p className="prize-reveal__empty-hint">
            แอดมินกรอกชื่อที่หน้า /admin-answers ก่อน แล้วกดปุ่มนี้อีกครั้ง
          </p>
        )}
        {contentVisible && !prize.isEmpty && prize.subtitle && (
          <p className="prize-reveal__subtitle">{prize.subtitle}</p>
        )}
        {contentVisible && prize.details?.length > 0 && (
          <dl className="prize-reveal__details">
            {prize.details.map((item) => (
              <div key={item.label} className="prize-reveal__detail-row">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {contentVisible && prize.note && (
          <p
            className={`prize-reveal__note ${
              prize.noteVariant === 'success' ? 'prize-reveal__note--success' : ''
            }`}
          >
            {prize.note}
          </p>
        )}
        {contentVisible && advanceLabel && onAdvance && (
          <button type="button" className="prize-reveal__advance" onClick={onAdvance}>
            {advanceLabel}
          </button>
        )}
        <p id="prize-reveal-title" className="prize-reveal__sr-only">
          {prize.revealLabel}: {prize.displayName}
        </p>
      </div>
    </div>
  )
}
