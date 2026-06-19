import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { getAudienceUrl } from '../config/site'
import './QrJoinModal.css'

export default function QrJoinModal({ open, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const audienceUrl = getAudienceUrl()

  useEffect(() => {
    if (!open) {
      return undefined
    }

    let cancelled = false

    QRCode.toDataURL(audienceUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f1f3a',
        light: '#f8f4e8',
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl('')
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, audienceUrl])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
      <button
        type="button"
        className="qr-modal__backdrop"
        aria-label="ปิด"
        onClick={onClose}
      />
      <div className="qr-modal__panel">
        <button type="button" className="qr-modal__close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>
        <p className="qr-modal__badge">STAT#55</p>
        <h2 id="qr-modal-title" className="qr-modal__title">
          สแกน QR Code เพื่อร่วมสนุก
        </h2>
        <p className="qr-modal__subtitle">เปิดกล้องแล้วสแกน เพื่อส่งคำตอบระหว่างเล่นเกม</p>

        <div className="qr-modal__code-wrap">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code สำหรับส่งคำตอบ" className="qr-modal__code" />
          ) : (
            <p className="qr-modal__loading">กำลังสร้าง QR Code...</p>
          )}
        </div>

        <a
          className="qr-modal__url"
          href={audienceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {audienceUrl}
        </a>
      </div>
    </div>
  )
}
