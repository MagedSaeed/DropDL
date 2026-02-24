import { useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { DownloadOptions } from '../types'

export function useDownload() {
  const { apiCall } = useAuth()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  const startDownload = useCallback(
    async (options: DownloadOptions) => {
      setDownloading(true)
      setError('')

      try {
        const res = await apiCall<Blob>('POST', '/api/download/', options, {
          responseType: 'blob',
        })

        // Extract filename from Content-Disposition header
        const disposition = res.headers['content-disposition'] || ''
        const filenameMatch = disposition.match(/filename="(.+?)"/)
        const filename = filenameMatch ? filenameMatch[1] : 'download'

        // Trigger browser download
        const url = URL.createObjectURL(res.data)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        // For blob responses, error data is also a blob - try to parse it
        const axiosErr = err as { response?: { data?: Blob | { error?: string } } }
        let message = 'Download failed. Please try again.'
        if (axiosErr.response?.data instanceof Blob) {
          try {
            const text = await axiosErr.response.data.text()
            const json = JSON.parse(text)
            if (json.error) message = json.error
          } catch {
            // ignore parse errors
          }
        } else if (axiosErr.response?.data && typeof axiosErr.response.data === 'object' && 'error' in axiosErr.response.data) {
          message = axiosErr.response.data.error || message
        }
        setError(message)
      } finally {
        setDownloading(false)
      }
    },
    [apiCall],
  )

  return { downloading, error, startDownload }
}
