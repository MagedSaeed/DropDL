import logging
from urllib.parse import quote

from django.http import Http404, StreamingHttpResponse
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Download
from .serializers import (
    DownloadRequestSerializer,
    DownloadSerializer,
    VideoInfoRequestSerializer,
)
from .services import extract_video_info, stream_download

logger = logging.getLogger(__name__)


class ExtractInfoView(APIView):
    """POST /api/extract-info/ - Extract video metadata from a URL."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VideoInfoRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            info = extract_video_info(serializer.validated_data["url"])
        except Exception as e:
            return Response(
                {"error": f"Failed to extract info: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(info)


class StreamDownloadView(APIView):
    """GET/POST /api/download/ - Stream a file download to the browser.

    GET  with query params is used by the browser for native downloads.
    POST with JSON body is kept for API clients.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return self._handle_download(request, request.query_params)

    def post(self, request):
        return self._handle_download(request, request.data)

    def _handle_download(self, request, incoming_data):
        serializer = DownloadRequestSerializer(data=incoming_data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        options = {
            "format": data.get("format", "best"),
            "extract_audio": data.get("extract_audio", False),
            "audio_format": data.get("audio_format", "mp3"),
            "audio_quality": data.get("audio_quality", "5"),
            "write_subtitles": data.get("write_subtitles", False),
            "subtitle_langs": data.get("subtitle_langs", []),
            "embed_subtitles": data.get("embed_subtitles", False),
            "playlist_items": data.get("playlist_items", ""),
            "rate_limit": data.get("rate_limit", ""),
        }

        try:
            generator, filename, content_type = stream_download(data["url"], options)
        except Exception as e:
            logger.exception("Download failed")
            return Response(
                {"error": f"Download failed: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save to history if user is authenticated
        if request.user.is_authenticated:
            Download.objects.create(
                user=request.user,
                url=data["url"],
                title=data.get("title", ""),
                thumbnail=data.get("thumbnail", ""),
                duration=data.get("duration"),
                uploader=data.get("uploader", ""),
                source_site=data.get("source_site", ""),
                options=options,
                file_name=filename,
                mime_type=content_type,
                status=Download.Status.COMPLETED,
            )

        # Always use octet-stream so browsers never try to play the file inline
        response = StreamingHttpResponse(generator, content_type="application/octet-stream")
        # RFC 5987: ASCII fallback + UTF-8 encoded name for proper special character handling
        ascii_filename = filename.encode("ascii", "replace").decode("ascii").replace('"', "'")
        response["Content-Disposition"] = (
            f'attachment; filename="{ascii_filename}"; filename*=UTF-8\'\'{quote(filename)}'
        )
        return response


class DownloadHistoryView(APIView):
    """GET /api/history/ - User's download history."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        downloads = Download.objects.filter(user=request.user)[:50]
        serializer = DownloadSerializer(downloads, many=True)
        return Response(serializer.data)


class DownloadHistoryDeleteView(APIView):
    """DELETE /api/history/<id>/ - Delete a download from history."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, download_id):
        try:
            download = Download.objects.get(pk=download_id, user=request.user)
        except Download.DoesNotExist:
            raise Http404
        download.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
