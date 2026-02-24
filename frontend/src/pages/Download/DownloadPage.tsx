import { useCallback, useState } from 'react'
import UrlInputBar from '../../components/UrlInputBar/UrlInputBar'
import SiteBanner from '../../components/SiteBanner/SiteBanner'
import VideoInfoCard from '../../components/VideoInfoCard/VideoInfoCard'
import OptionsPanel from '../../components/OptionsPanel/OptionsPanel'
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary'
import { useVideoInfo } from '../../hooks/useVideoInfo'
import { useDownload } from '../../hooks/useDownload'
import { useToast } from '../../contexts/ToastContext'
import type { DownloadOptions } from '../../types'

const DEFAULT_OPTIONS: Omit<DownloadOptions, 'url'> = {
  format: 'best',
  extract_audio: false,
  audio_format: 'mp3',
  audio_quality: '5',
  write_subtitles: false,
  subtitle_langs: [],
  embed_subtitles: false,
  playlist_items: '',
  rate_limit: '',
}

export default function DownloadPage() {
  const [url, setUrl] = useState('')
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const { videoInfo, loading: fetchLoading, error: fetchError, fetchInfo, reset } = useVideoInfo()
  const { downloading, error: downloadError, startDownload } = useDownload()
  const { showToast } = useToast()

  const handleFetch = useCallback(() => {
    if (url.trim()) {
      setOptions(DEFAULT_OPTIONS)
      fetchInfo(url.trim())
    }
  }, [url, fetchInfo])

  const handleDownload = useCallback(async () => {
    if (!url.trim()) return
    try {
      await startDownload({ url: url.trim(), ...options })
      showToast('success', 'Download started! Check your browser downloads.')
    } catch {
      // error is handled in the hook
    }
  }, [url, options, startDownload, showToast])

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setUrl(newUrl)
      if (!newUrl.trim()) reset()
    },
    [reset],
  )

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* URL Input */}
        <UrlInputBar
          value={url}
          onChange={handleUrlChange}
          onSubmit={handleFetch}
          loading={fetchLoading}
          error={fetchError}
        />

        <SiteBanner />

        {/* Loading skeleton */}
        {fetchLoading && (
          <div className="card animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-56 h-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
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
        )}

        {/* Video Info + Options + Download */}
        {videoInfo && (
          <>
            <VideoInfoCard info={videoInfo} />

            <OptionsPanel
              options={{ url, ...options }}
              onChange={(newOpts) => {
                const { url: _, ...rest } = newOpts
                setOptions(rest)
              }}
              videoInfo={videoInfo}
            />

            {/* Download button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary px-8 py-3 text-base w-full sm:w-auto"
              >
                {downloading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Downloading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </span>
                )}
              </button>

              {downloadError && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
                  {downloadError}
                </p>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!videoInfo && !fetchLoading && !fetchError && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 4V2m5 2V2m5 2V2M4 7h16M5 7v13a2 2 0 002 2h10a2 2 0 002-2V7M9 12l2 2 4-4"
              />
            </svg>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              Paste a URL above to get started
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
