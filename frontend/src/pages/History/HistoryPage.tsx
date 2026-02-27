import { useEffect } from 'react'
import { useHistory } from '../../hooks/useHistory'
import { formatDuration, formatFileSize } from '../../utils/formatters'
import type { DownloadRecord } from '../../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

function buildDownloadUrl(record: DownloadRecord): string {
  const params = new URLSearchParams()
  params.set('url', record.url)
  const opts = record.options as Record<string, unknown>
  for (const [key, value] of Object.entries(opts)) {
    if (value == null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
    } else {
      params.append(key, String(value))
    }
  }
  return `${API_BASE}/api/download/?${params.toString()}`
}

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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-56 aspect-video bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
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
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="card flex flex-col sm:flex-row gap-4 overflow-hidden">
              {/* Thumbnail */}
              {record.thumbnail ? (
                <a
                  href={record.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 sm:w-56 block"
                >
                  <img
                    src={record.thumbnail}
                    alt={record.title}
                    className="w-full sm:w-56 h-auto rounded-lg object-cover aspect-video bg-zinc-100 dark:bg-zinc-700 hover:opacity-80 transition-opacity"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="shrink-0 sm:w-56 aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                  <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1.5">
                  <a
                    href={record.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {record.title || record.url}
                  </a>
                </h3>

                {record.uploader && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    {record.uploader}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {record.duration != null && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(record.duration)}
                    </span>
                  )}

                  {record.source_site && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium dark:bg-zinc-700 dark:text-zinc-300">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(record.url).hostname}&sz=16`}
                        alt=""
                        className="w-4 h-4"
                        loading="lazy"
                      />
                      {record.source_site}
                    </span>
                  )}

                  {record.file_size != null && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {formatFileSize(record.file_size)}
                    </span>
                  )}

                  {record.download_count > 1 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/40 dark:text-blue-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {record.download_count}x
                    </span>
                  )}

                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {new Date(record.last_downloaded_at).toLocaleDateString()}
                  </span>
                </div>

                {record.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
                    {record.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0 flex sm:flex-col items-center gap-1 self-start">
                <a
                  href={buildDownloadUrl(record)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  aria-label="Download again"
                  title="Download again"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <button
                  onClick={() => deleteRecord(record.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  aria-label="Delete from history"
                  title="Delete from history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
