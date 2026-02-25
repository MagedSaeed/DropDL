import { useCallback, useEffect, useRef, useState } from 'react'
import type { DownloadOptions } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

function getCSRFToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}

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

      // Use a hidden form + iframe to trigger a native browser download.
      // Unlike Axios with responseType:'blob', this doesn't buffer the
      // entire file in JavaScript memory before starting the download.
      // The browser's native download manager handles streaming and progress.
      const frameName = `dl-${Date.now()}`
      const iframe = document.createElement('iframe')
      iframe.name = frameName
      iframe.style.display = 'none'

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = `${API_BASE}/api/download/`
      form.target = frameName
      form.style.display = 'none'

      const addField = (name: string, value: string) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        input.value = value
        form.appendChild(input)
      }

      addField('csrfmiddlewaretoken', getCSRFToken())

      for (const [key, value] of Object.entries(options)) {
        if (Array.isArray(value)) {
          for (const item of value) addField(key, String(item))
        } else {
          addField(key, String(value))
        }
      }

      let cleaned = false
      const cleanup = () => {
        if (cleaned) return
        cleaned = true
        setDownloading(false)
        if (timerRef.current) clearTimeout(timerRef.current)
        setTimeout(() => {
          iframe.remove()
          form.remove()
        }, 1000)
      }

      // The iframe's load event fires when the server returns a non-file
      // response (i.e. error JSON). File downloads (Content-Disposition:
      // attachment) don't load content into the iframe.
      iframe.addEventListener('load', () => {
        try {
          const text = iframe.contentDocument?.body?.textContent?.trim()
          if (text) {
            try {
              const data = JSON.parse(text)
              setError(data.error || 'Download failed.')
            } catch {
              setError('Download failed. Please try again.')
            }
          }
        } catch {
          // Cross-origin or security error — download likely succeeded
        }
        cleanup()
      })

      document.body.appendChild(iframe)
      document.body.appendChild(form)
      form.submit()

      // Reset loading state after timeout. The browser's native download
      // manager takes over from here.
      timerRef.current = setTimeout(cleanup, 10_000)
    },
    [],
  )

  return { downloading, error, startDownload }
}
