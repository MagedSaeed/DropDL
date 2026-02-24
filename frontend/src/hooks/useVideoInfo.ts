import { useCallback, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { VideoInfo } from '../types'

export function useVideoInfo() {
  const { apiCall } = useAuth()
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const fetchInfo = useCallback(
    async (url: string) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError('')
      setVideoInfo(null)

      try {
        const res = await apiCall<VideoInfo>('POST', '/api/extract-info/', { url })
        if (!controller.signal.aborted) {
          setVideoInfo(res.data)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Failed to fetch video info. Please check the URL and try again.'
          setError(message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    },
    [apiCall],
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setVideoInfo(null)
    setLoading(false)
    setError('')
  }, [])

  return { videoInfo, loading, error, fetchInfo, reset }
}
