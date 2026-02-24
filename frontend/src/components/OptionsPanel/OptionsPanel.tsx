import { useCallback, useMemo, useState } from 'react'
import type { DownloadOptions, VideoInfo } from '../../types'
import { formatFileSize } from '../../utils/formatters'

interface OptionsPanelProps {
  options: DownloadOptions
  onChange: (options: DownloadOptions) => void
  videoInfo: VideoInfo
}

const AUDIO_FORMATS = ['mp3', 'aac', 'flac', 'm4a', 'opus', 'vorbis', 'wav'] as const
const AUDIO_QUALITIES = [
  { value: '0', label: 'Best' },
  { value: '2', label: 'High' },
  { value: '5', label: 'Medium' },
  { value: '8', label: 'Low' },
] as const

export default function OptionsPanel({ options, onChange, videoInfo }: OptionsPanelProps) {
  const hasSubtitles = Object.keys(videoInfo.subtitles).length > 0 || Object.keys(videoInfo.automatic_captions).length > 0

  const update = useCallback(
    (patch: Partial<DownloadOptions>) => {
      onChange({ ...options, ...patch })
    },
    [options, onChange],
  )

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

  const isCustomFormat = !presets.some((p) => p.value === options.format)

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
      update({ subtitle_langs: updated })
    },
    [options.subtitle_langs, update],
  )

  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card !p-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 sm:px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Download Options
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5">
        {/* Format */}
        <div>
          <label className="form-label" htmlFor="format-select">Format & Quality</label>
          <select
            id="format-select"
            value={isCustomFormat ? '__custom__' : options.format}
            onChange={(e) => {
              if (e.target.value !== '__custom__') {
                update({ format: e.target.value })
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

        {isCustomFormat && (
          <div>
            <label className="form-label" htmlFor="custom-format">Custom Format Code</label>
            <input
              id="custom-format"
              type="text"
              value={options.format}
              onChange={(e) => update({ format: e.target.value })}
              placeholder="e.g., 137+140 or bestvideo[ext=mp4]+bestaudio"
              className="input-field font-mono text-sm"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Uses yt-dlp format selection syntax
            </p>
          </div>
        )}

        {/* Audio & Subtitles toggles */}
        <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.extract_audio}
                onChange={(e) => update({ extract_audio: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-700"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Extract audio only
              </span>
            </label>

            {hasSubtitles && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.write_subtitles}
                  onChange={(e) => update({ write_subtitles: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-700"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Download subtitles
                </span>
              </label>
            )}
          </div>

          {/* Audio options (expanded) */}
          {options.extract_audio && (
            <div className="grid grid-cols-2 gap-4 pl-7 mt-3">
              <div>
                <label className="form-label" htmlFor="audio-format">Audio Format</label>
                <select
                  id="audio-format"
                  value={options.audio_format}
                  onChange={(e) => update({ audio_format: e.target.value })}
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
                  onChange={(e) => update({ audio_quality: e.target.value })}
                  className="input-field"
                >
                  {AUDIO_QUALITIES.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Subtitle options (expanded) */}
          {options.write_subtitles && hasSubtitles && (
            <div className="pl-7 mt-3 space-y-3">
              <div>
                <label className="form-label">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {availableLangs.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLang(lang)}
                      className={`
                        px-2.5 py-1 text-xs font-medium rounded-md border transition-colors
                        ${options.subtitle_langs.includes(lang)
                          ? 'bg-zinc-100 border-zinc-400 text-zinc-900 dark:bg-zinc-600 dark:border-zinc-500 dark:text-zinc-100'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-400'
                        }
                      `}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.embed_subtitles}
                  onChange={(e) => update({ embed_subtitles: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-700"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Embed subtitles in video file
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Playlist */}
        {videoInfo.is_playlist && (
          <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4 space-y-3">
            <div>
              <label className="form-label" htmlFor="playlist-items">
                Playlist items to download
              </label>
              <input
                id="playlist-items"
                type="text"
                value={options.playlist_items}
                onChange={(e) => update({ playlist_items: e.target.value })}
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
        )}
      </div>
      )}
    </div>
  )
}
