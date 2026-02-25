import { useCallback, useEffect, useRef, useState } from 'react'
import type { DownloadOptions } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

export function useDownload() {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const startDownload = useCallback(
    (options: DownloadOptions) => {
      setDownloading(true)
      setError('')

      // Build a GET URL with query parameters, then navigate to it.
      // The browser handles the Content-Disposition: attachment response
      // natively — streaming to disk with its own download progress bar.
      // This is the same pattern used by anonymous-hf (<a href="...">).
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(options)) {
        if (Array.isArray(value)) {
          for (const item of value) params.append(key, String(item))
        } else {
          params.append(key, String(value))
        }
      }

      window.location.href = `${API_BASE}/api/download/?${params.toString()}`

      // Brief loading state to prevent double-clicks.
      // The browser's native download manager takes over from here.
      timerRef.current = setTimeout(() => setDownloading(false), 3000)
    },
    [],
  )

  return { downloading, error, startDownload }
}
