from rest_framework import serializers

from .models import Download


class VideoInfoRequestSerializer(serializers.Serializer):
    url = serializers.URLField(max_length=2000)


class DownloadRequestSerializer(serializers.Serializer):
    url = serializers.URLField(max_length=2000)
    format = serializers.CharField(required=False, default="best")
    extract_audio = serializers.BooleanField(required=False, default=False)
    audio_format = serializers.ChoiceField(
        choices=["mp3", "aac", "flac", "m4a", "opus", "vorbis", "wav"],
        required=False,
        default="mp3",
    )
    audio_quality = serializers.ChoiceField(
        choices=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        required=False,
        default="5",
    )
    write_subtitles = serializers.BooleanField(required=False, default=False)
    subtitle_langs = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    embed_subtitles = serializers.BooleanField(required=False, default=False)
    playlist_items = serializers.CharField(required=False, default="", allow_blank=True)
    rate_limit = serializers.CharField(required=False, default="", allow_blank=True)

    # Optional metadata for history (passed from extract-info results)
    title = serializers.CharField(required=False, default="", allow_blank=True)
    description = serializers.CharField(required=False, default="", allow_blank=True)
    thumbnail = serializers.URLField(required=False, default="", allow_blank=True)
    duration = serializers.IntegerField(required=False, default=None, allow_null=True)
    uploader = serializers.CharField(required=False, default="", allow_blank=True)
    source_site = serializers.CharField(required=False, default="", allow_blank=True)


class DownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Download
        fields = [
            "id", "url", "source_site", "title", "description",
            "thumbnail", "duration", "uploader", "status", "file_name",
            "file_size", "mime_type", "options", "created_at",
        ]
        read_only_fields = fields
