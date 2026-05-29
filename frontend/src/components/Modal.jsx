import { useEffect } from 'react'

export default function Modal({ title, open, onClose, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${widths[size]} rounded-xl border border-stone-200 bg-white shadow-card`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
