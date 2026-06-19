export default function AdminPrizePanel({
  label,
  hint,
  savedName,
  open,
  onToggle,
  variant,
  children,
}) {
  const panelClass = [
    'admin-arrival-panel',
    variant ? `admin-arrival-panel--${variant}` : '',
    open ? '' : 'admin-arrival-panel--collapsed',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={panelClass}>
      <div className="admin-arrival-panel__header">
        <div className="admin-arrival-panel__title-wrap">
          <p className="admin-arrival-panel__label">{label}</p>
          {!open && savedName && (
            <p className="admin-arrival-panel__current">
              บันทึกแล้ว: <strong>{savedName}</strong>
            </p>
          )}
          {!open && !savedName && (
            <p className="admin-arrival-panel__collapsed-hint">ยังไม่ได้บันทึก — กดขยายเพื่อกรอก</p>
          )}
        </div>
        <button
          type="button"
          className="admin-arrival-panel__toggle"
          onClick={onToggle}
          aria-expanded={open}
        >
          <span className="admin-arrival-panel__toggle-icon" aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
          {open ? 'ย่อ' : 'ขยาย'}
        </button>
      </div>

      {open && (
        <div className="admin-arrival-panel__body">
          {hint && <p className="admin-arrival-panel__hint">{hint}</p>}
          {savedName && (
            <p className="admin-arrival-panel__current">
              บันทึกแล้ว: <strong>{savedName}</strong>
            </p>
          )}
          {children}
        </div>
      )}
    </section>
  )
}
