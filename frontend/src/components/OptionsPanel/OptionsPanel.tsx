import { useCallback, useMemo, useState } from 'react'
import type { DownloadOptions, VideoInfo } from '../../types'
import { formatFileSize } from '../../utils/formatters'

interface OptionsPanelProps {
  options: DownloadOptions
  onChange: (options: DownloadOptions) => void
  videoInfo: VideoInfo
}

type Tab = 'format' | 'audio' | 'subtitles' | 'playlist' | 'advanced'

const AUDIO_FORMATS = ['mp3', 'aac', 'flac', 'm4a', 'opus', 'vorbis', 'wav'] as const
const AUDIO_QUALITIES = [
  { value: '0', label: 'Best' },
  { value: '2', label: 'High' },
  { value: '5', label: 'Medium' },
  { value: '8', label: 'Low' },
] as const

export default function OptionsPanel({ options, onChange, videoInfo }: OptionsPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('format')

  const hasSubtitles = Object.keys(videoInfo.subtitles).length > 0 || Object.keys(videoInfo.automatic_captions).length > 0

  const tabs = useMemo(() => {
    const t: { id: Tab; label: string }[] = [{ id: 'format', label: 'Format' }]
    t.push({ id: 'audio', label: 'Audio' })
    if (hasSubtitles) t.push({ id: 'subtitles', label: 'Subtitles' })
    if (videoInfo.is_playlist) t.push({ id: 'playlist', label: 'Playlist' })
    t.push({ id: 'advanced', label: 'Advanced' })
    return t
  }, [hasSubtitles, videoInfo.is_playlist])

  const update = useCallback(
    (patch: Partial<DownloadOptions>) => {
      onChange({ ...options, ...patch })
    },
    [options, onChange],
  )

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Download Options
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-700">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-zinc-100 dark:border-zinc-700 px-4 sm:px-6 gap-1" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-4 sm:px-6 py-4" role="tabpanel">
            {activeTab === 'format' && (
              <FormatTab options={options} onChange={update} videoInfo={videoInfo} />
            )}
            {activeTab === 'audio' && (
              <AudioTab options={options} onChange={update} />
            )}
            {activeTab === 'subtitles' && (
              <SubtitlesTab options={options} onChange={update} videoInfo={videoInfo} />
            )}
            {activeTab === 'playlist' && (
              <PlaylistTab options={options} onChange={update} videoInfo={videoInfo} />
            )}
            {activeTab === 'advanced' && (
              <AdvancedTab options={options} onChange={update} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Tab Components ---- */

function FormatTab({ options, onChange, videoInfo }: { options: DownloadOptions; onChange: (p: Partial<DownloadOptions>) => void; videoInfo: VideoInfo }) {
  const presets = useMemo(() => {
    const groups: { label: string; value: string; size?: string }[] = [
      { label: 'Best Quality (auto)', value: 'best' },
      { label: 'Best Video + Audio', value: 'bestvideo+bestaudio/best' },
    ]

    const resolutions = ['1080', '720', '480', '360']
    for (const res of resolutions) {
      const matching = videoInfo.formats.filter(
        (f) => f.has_video && f.resolution?.includes(res),
      )
      if (matching.length > 0) {
        const best = matching[0]
        const size = best.filesize || best.filesize_approx
        groups.push({
          label: `${res}p`,
          value: `bestvideo[height<=${res}]+bestaudio/best[height<=${res}]`,
          size: size ? formatFileSize(size) : undefined,
        })
      }
    }

    groups.push({ label: 'Audio Only (best)', value: 'bestaudio/best' })
    groups.push({ label: 'Worst Quality (smallest)', value: 'worst' })

    return groups
  }, [videoInfo.formats])

  const isCustom = !presets.some((p) => p.value === options.format)

  return (
    <div className="space-y-3">
      <div>
        <label className="form-label" htmlFor="format-select">Video Format & Quality</label>
        <select
          id="format-select"
          value={isCustom ? '__custom__' : options.format}
          onChange={(e) => {
            if (e.target.value !== '__custom__') {
              onChange({ format: e.target.value })
            }
          }}
          className="input-field"
        >
          {presets.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}{p.size ? ` (~${p.size})` : ''}
            </option>
          ))}
          <option value="__custom__">Custom format code...</option>
        </select>
      </div>

      {isCustom && (
        <div>
          <label className="form-label" htmlFor="custom-format">Custom Format Code</label>
          <input
            id="custom-format"
            type="text"
            value={options.format}
            onChange={(e) => onChange({ format: e.target.value })}
            placeholder="e.g., 137+140 or bestvideo[ext=mp4]+bestaudio"
            className="input-field font-mono text-sm"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Uses yt-dlp format selection syntax
          </p>
        </div>
      )}
    </div>
  )
}

function AudioTab({ options, onChange }: { options: DownloadOptions; onChange: (p: Partial<DownloadOptions>) => void }) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={options.extract_audio}
          onChange={(e) => onChange({ extract_audio: e.target.checked })}
          className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-700"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Extract audio only
        </span>
      </label>

      {options.extract_audio && (
        <div className="grid grid-cols-2 gap-4 pl-7">
          <div>
            <label className="form-label" htmlFor="audio-format">Audio Format</label>
            <select
              id="audio-format"
              value={options.audio_format}
              onChange={(e) => onChange({ audio_format: e.target.value })}
              className="input-field"
            >
              {AUDIO_FORMATS.map((f) => (
                <option key={f} value={f}>{f.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="audio-quality">Quality</label>
            <select
              id="audio-quality"
              value={options.audio_quality}
              onChange={(e) => onChange({ audio_quality: e.target.value })}
              className="input-field"
            >
              {AUDIO_QUALITIES.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

function SubtitlesTab({ options, onChange, videoInfo }: { options: DownloadOptions; onChange: (p: Partial<DownloadOptions>) => void; videoInfo: VideoInfo }) {
  const availableLangs = useMemo(() => {
    const langs = new Set<string>()
    for (const lang of Object.keys(videoInfo.subtitles)) langs.add(lang)
    for (const lang of Object.keys(videoInfo.automatic_captions)) langs.add(lang)
    return Array.from(langs).sort()
  }, [videoInfo.subtitles, videoInfo.automatic_captions])

  const toggleLang = useCallback(
    (lang: string) => {
      const current = options.subtitle_langs
      const updated = current.includes(lang)
        ? current.filter((l) => l !== lang)
        : [...current, lang]
      onChange({ subtitle_langs: updated })
    },
    [options.subtitle_langs, onChange],
  )

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={options.write_subtitles}
          onChange={(e) => onChange({ write_subtitles: e.target.checked })}
          className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-700"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Download subtitles
        </span>
      </label>

      {options.write_subtitles && (
        <>
          <div className="pl-7">
            <label className="form-label">Languages</label>
            <div className="flex flex-wrap gap-2">
              {availableLangs.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLang(lang)}
                  className={`
                    px-2.5 py-1 text-xs font-medium rounded-md border transition-colors
                    ${options.subtitle_langs.includes(lang)
                      ? 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950 dark:border-violet-700 dark:text-violet-300'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400'
                    }
                  `}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer pl-7">
            <input
              type="checkbox"
              checked={options.embed_subtitles}
              onChange={(e) => onChange({ embed_subtitles: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-700"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Embed subtitles in video file
            </span>
          </label>
        </>
      )}
    </div>
  )
}

function PlaylistTab({ options, onChange, videoInfo }: { options: DownloadOptions; onChange: (p: Partial<DownloadOptions>) => void; videoInfo: VideoInfo }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="form-label" htmlFor="playlist-items">
          Items to download
        </label>
        <input
          id="playlist-items"
          type="text"
          value={options.playlist_items}
          onChange={(e) => onChange({ playlist_items: e.target.value })}
          placeholder="e.g., 1-5 or 1,3,7"
          className="input-field"
        />
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Leave empty to download all {videoInfo.playlist_count || ''} items
        </p>
      </div>

      {videoInfo.entries.length > 0 && (
        <div>
          <label className="form-label">Playlist Items</label>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-700">
            {videoInfo.entries.map((entry, i) => (
              <div key={entry.id || i} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="text-zinc-400 dark:text-zinc-500 tabular-nums w-6 text-right shrink-0">
                  {i + 1}
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 truncate flex-1">
                  {entry.title || 'Untitled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AdvancedTab({ options, onChange }: { options: DownloadOptions; onChange: (p: Partial<DownloadOptions>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="form-label" htmlFor="rate-limit">
          Rate Limit
        </label>
        <input
          id="rate-limit"
          type="text"
          value={options.rate_limit}
          onChange={(e) => onChange({ rate_limit: e.target.value })}
          placeholder="e.g., 5M for 5 MB/s"
          className="input-field"
        />
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Maximum download speed. Use K for KB/s, M for MB/s.
        </p>
      </div>
    </div>
  )
}
