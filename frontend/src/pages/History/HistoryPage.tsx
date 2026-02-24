import { useEffect } from 'react'
import { useHistory } from '../../hooks/useHistory'
import { formatDuration, formatFileSize } from '../../utils/formatters'

export default function HistoryPage() {
  const { records, loading, error, fetchHistory, deleteRecord } = useHistory()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loading) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Download History</h1>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Download History</h1>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No downloads yet</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
            Your download history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="card flex items-center gap-4">
              {/* Thumbnail */}
              {record.thumbnail ? (
                <img
                  src={record.thumbnail}
                  alt=""
                  className="w-24 h-16 rounded object-cover bg-zinc-100 dark:bg-zinc-700 shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-16 rounded bg-zinc-100 dark:bg-zinc-700 shrink-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {record.title || record.url}
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  {record.source_site && <span>{record.source_site}</span>}
                  {record.duration != null && <span>{formatDuration(record.duration)}</span>}
                  {record.file_size != null && <span>{formatFileSize(record.file_size)}</span>}
                  <span>{new Date(record.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => deleteRecord(record.id)}
                className="shrink-0 p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                aria-label="Delete from history"
                title="Delete from history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
