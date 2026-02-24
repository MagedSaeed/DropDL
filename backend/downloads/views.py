import logging

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
    """POST /api/download/ - Stream a file download to the browser."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DownloadRequestSerializer(data=request.data)
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
                options=options,
                file_name=filename,
                mime_type=content_type,
                status=Download.Status.COMPLETED,
            )

        response = StreamingHttpResponse(generator, content_type=content_type)
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
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
