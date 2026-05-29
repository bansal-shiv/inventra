export default function Notice({ message, kind = 'error', onClose }) {
  if (!message) return null

  const tone =
    kind === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-700'

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm ${tone}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  )
}
