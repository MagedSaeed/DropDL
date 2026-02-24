import { useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { DownloadRecord } from '../types'

export function useHistory() {
  const { apiCall } = useAuth()
  const [records, setRecords] = useState<DownloadRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiCall<DownloadRecord[]>('GET', '/api/history/')
      setRecords(res.data)
    } catch {
      setError('Failed to load download history.')
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const deleteRecord = useCallback(
    async (id: string) => {
      try {
        await apiCall('DELETE', `/api/history/${id}/`)
        setRecords((prev) => prev.filter((r) => r.id !== id))
      } catch {
        setError('Failed to delete record.')
      }
    },
    [apiCall],
  )

  return { records, loading, error, fetchHistory, deleteRecord }
}
