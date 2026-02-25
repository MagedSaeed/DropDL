import logging
import mimetypes
import shutil
import tempfile
from pathlib import Path

import requests as http_requests
import yt_dlp
from django.conf import settings

logger = logging.getLogger(__name__)

TEMP_DIR = getattr(settings, "DOWNLOAD_TEMP_DIR", Path(tempfile.gettempdir()) / "dropdl")


def _get_pot_extractor_args() -> dict:
    """Return yt-dlp extractor_args for PO token server if configured."""
    pot_url = getattr(settings, "POT_SERVER_URL", None)
    if pot_url:
        return {"youtubepot-bgutilhttp": {"base_url": [pot_url]}}
    return {}


def extract_video_info(url: str) -> dict:
    """Extract video metadata without downloading."""
    pot_args = _get_pot_extractor_args()
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        "skip_download": True,
        **({"extractor_args": pot_args} if pot_args else {}),
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    if info is None:
        raise ValueError("Could not extract info from URL")

    is_playlist = info.get("_type") == "playlist" or "entries" in info
    entries = []
    if is_playlist and "entries" in info:
        for entry in info["entries"] or []:
            if entry:
                entries.append({
                    "id": entry.get("id", ""),
                    "title": entry.get("title", ""),
                    "duration": entry.get("duration"),
                    "url": entry.get("webpage_url") or entry.get("url", ""),
                })

    formats = []
    for f in info.get("formats", []):
        vcodec = f.get("vcodec", "none")
        acodec = f.get("acodec", "none")
        formats.append({
            "format_id": f.get("format_id", ""),
            "ext": f.get("ext", ""),
            "resolution": f.get("resolution", ""),
            "fps": f.get("fps"),
            "vcodec": vcodec if vcodec != "none" else "",
            "acodec": acodec if acodec != "none" else "",
            "filesize": f.get("filesize"),
            "filesize_approx": f.get("filesize_approx"),
            "format_note": f.get("format_note", ""),
            "quality": f.get("quality"),
            "has_video": vcodec not in ("none", None),
            "has_audio": acodec not in ("none", None),
            "tbr": f.get("tbr"),
            "abr": f.get("abr"),
            "vbr": f.get("vbr"),
        })

    subtitles = {}
    for lang, subs in (info.get("subtitles") or {}).items():
        subtitles[lang] = [{"ext": s.get("ext", ""), "url": s.get("url", "")} for s in subs[:3]]

    auto_captions = {}
    for lang, caps in (info.get("automatic_captions") or {}).items():
        auto_captions[lang] = [{"ext": c.get("ext", ""), "url": c.get("url", "")} for c in caps[:1]]

    return {
        "id": info.get("id", ""),
        "title": info.get("title", ""),
        "thumbnail": info.get("thumbnail", ""),
        "duration": info.get("duration"),
        "uploader": info.get("uploader", ""),
        "description": (info.get("description") or "")[:500],
        "webpage_url": info.get("webpage_url", url),
        "extractor": info.get("extractor", ""),
        "formats": formats,
        "subtitles": subtitles,
        "automatic_captions": auto_captions,
        "is_playlist": is_playlist,
        "playlist_count": info.get("playlist_count") or len(entries),
        "entries": entries[:50],
    }


def _needs_processing(options: dict) -> bool:
    """Check if the download requires server-side processing (ffmpeg)."""
    if options.get("extract_audio"):
        return True
    if options.get("embed_subtitles"):
        return True
    fmt = options.get("format", "best")
    if "+" in fmt:
        return True
    return False


def _get_direct_url(url: str, format_id: str) -> tuple[str, dict, str]:
    """Get the direct download URL and metadata for a single format."""
    pot_args = _get_pot_extractor_args()
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "format": format_id,
        **({"extractor_args": pot_args} if pot_args else {}),
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
    if info is None:
        raise ValueError("Could not extract info")

    direct_url = info.get("url", "")
    http_headers = info.get("http_headers", {})
    ext = info.get("ext", "mp4")
    title = info.get("title", "download")
    filename = f"{title}.{ext}"
    return direct_url, http_headers, filename


def stream_download(url: str, options: dict):
    """
    Generator that yields file chunks for StreamingHttpResponse.

    For simple formats: proxy-streams from the direct source URL.
    For processed formats: downloads to temp, streams, then cleans up.

    Returns (generator, filename, content_type).
    """
    if _needs_processing(options):
        return _stream_processed(url, options)
    else:
        return _stream_direct(url, options)


def _stream_direct(url: str, options: dict) -> tuple:
    """Proxy-stream a single format directly from the source."""
    format_id = options.get("format", "best")
    direct_url, http_headers, filename = _get_direct_url(url, format_id)

    if not direct_url:
        raise ValueError("Could not get direct download URL")

    mime, _ = mimetypes.guess_type(filename)
    content_type = mime or "application/octet-stream"

    def generate():
        with http_requests.get(direct_url, headers=http_headers, stream=True, timeout=600) as r:
            r.raise_for_status()
            for chunk in r.iter_content(chunk_size=256 * 1024):
                if chunk:
                    yield chunk

    return generate(), filename, content_type


def _stream_processed(url: str, options: dict) -> tuple:
    """Download with yt-dlp processing, then stream the result."""
    tmp_dir = Path(tempfile.mkdtemp(dir=TEMP_DIR))

    pot_args = _get_pot_extractor_args()
    ydl_opts = {
        "outtmpl": str(tmp_dir / "%(title)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "format": options.get("format", "best"),
        **({"extractor_args": pot_args} if pot_args else {}),
    }

    if options.get("extract_audio"):
        ydl_opts["postprocessors"] = [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": options.get("audio_format", "mp3"),
            "preferredquality": options.get("audio_quality", "5"),
        }]

    if options.get("write_subtitles"):
        ydl_opts["writesubtitles"] = True
        ydl_opts["subtitleslangs"] = options.get("subtitle_langs", ["en"])
        if options.get("embed_subtitles"):
            ydl_opts.setdefault("postprocessors", []).append({
                "key": "FFmpegEmbedSubtitle",
            })

    playlist_items = options.get("playlist_items", "")
    if playlist_items:
        ydl_opts["playlist_items"] = playlist_items

    rate_limit = options.get("rate_limit", "")
    if rate_limit:
        ydl_opts["ratelimit"] = rate_limit

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        files = list(tmp_dir.iterdir())
        if not files:
            raise FileNotFoundError("No file produced by download")

        main_file = max(files, key=lambda f: f.stat().st_size)
        mime, _ = mimetypes.guess_type(str(main_file))
        content_type = mime or "application/octet-stream"
        filename = main_file.name

        def generate():
            try:
                with open(main_file, "rb") as f:
                    while True:
                        chunk = f.read(256 * 1024)
                        if not chunk:
                            break
                        yield chunk
            finally:
                shutil.rmtree(tmp_dir, ignore_errors=True)

        return generate(), filename, content_type

    except Exception:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise
