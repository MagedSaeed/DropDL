export interface User {
  id: number
  username: string
  email: string
  avatar_url: string
  date_joined: string
}

export interface VideoFormat {
  format_id: string
  ext: string
  resolution: string
  fps: number | null
  vcodec: string
  acodec: string
  filesize: number | null
  filesize_approx: number | null
  format_note: string
  quality: number | null
  has_video: boolean
  has_audio: boolean
  tbr: number | null
  abr: number | null
  vbr: number | null
}

export interface PlaylistEntry {
  id: string
  title: string
  duration: number | null
  url: string
}

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: number | null
  uploader: string
  description: string
  webpage_url: string
  extractor: string
  formats: VideoFormat[]
  subtitles: Record<string, Array<{ ext: string; url: string }>>
  automatic_captions: Record<string, Array<{ ext: string; url: string }>>
  is_playlist: boolean
  playlist_count: number | null
  entries: PlaylistEntry[]
}

export interface DownloadOptions {
  url: string
  format: string
  extract_audio: boolean
  audio_format: string
  audio_quality: string
  write_subtitles: boolean
  subtitle_langs: string[]
  embed_subtitles: boolean
  playlist_items: string
  rate_limit: string
  // Optional metadata saved to history
  title?: string
  description?: string
  thumbnail?: string
  duration?: number | null
  uploader?: string
  source_site?: string
}

export interface DownloadRecord {
  id: string
  url: string
  source_site: string
  title: string
  description: string
  thumbnail: string
  duration: number | null
  uploader: string
  status: string
  file_name: string
  file_size: number | null
  mime_type: string
  options: Record<string, unknown>
  created_at: string
}
