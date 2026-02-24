import type { VideoInfo } from '../../types'
import { formatDuration } from '../../utils/formatters'

interface VideoInfoCardProps {
  info: VideoInfo
}

export default function VideoInfoCard({ info }: VideoInfoCardProps) {
  return (
    <div className="card flex flex-col sm:flex-row gap-4 overflow-hidden">
      {/* Thumbnail */}
      {info.thumbnail && (
        <div className="shrink-0 sm:w-56">
          <img
            src={info.thumbnail}
            alt={info.title}
            className="w-full sm:w-56 h-auto rounded-lg object-cover aspect-video bg-zinc-100 dark:bg-zinc-700"
            loading="lazy"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1.5">
          {info.title}
        </h3>

        {info.uploader && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            {info.uploader}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {info.duration != null && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(info.duration)}
            </span>
          )}

          <span className="inline-flex items-center px-2 py-1 rounded-md bg-violet-50 text-violet-700 font-medium dark:bg-violet-950 dark:text-violet-300">
            {info.extractor}
          </span>

          {info.is_playlist && info.playlist_count != null && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Playlist: {info.playlist_count} items
            </span>
          )}
        </div>

        {info.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
            {info.description}
          </p>
        )}
      </div>
    </div>
  )
}
