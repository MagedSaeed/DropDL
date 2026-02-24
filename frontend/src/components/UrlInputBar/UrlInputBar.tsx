import { useCallback, type FormEvent, type KeyboardEvent } from 'react'

interface UrlInputBarProps {
  value: string
  onChange: (url: string) => void
  onSubmit: () => void
  loading: boolean
  error: string
}

export default function UrlInputBar({ value, onChange, onSubmit, loading, error }: UrlInputBarProps) {
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (value.trim() && !loading) onSubmit()
    },
    [value, loading, onSubmit],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (value.trim() && !loading) onSubmit()
      }
    },
    [value, loading, onSubmit],
  )

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a video or audio URL here..."
            className="input-field pr-32 py-4 text-base"
            aria-label="Video or audio URL"
            autoFocus
          />
          <div className="absolute right-2">
            <button
              type="submit"
              disabled={!value.trim() || loading}
              className="btn-primary px-5 py-2"
              aria-label="Fetch video information"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching...
                </span>
              ) : (
                'Fetch Info'
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
