import uuid

from django.conf import settings
from django.db import models


class Download(models.Model):
    """Tracks a download request for history purposes."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        EXTRACTING = "extracting", "Extracting Info"
        DOWNLOADING = "downloading", "Downloading"
        PROCESSING = "processing", "Post-Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    # UUID so download IDs aren't guessable in public URLs
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="downloads",
    )

    # Source information
    url = models.URLField(max_length=2000)
    source_site = models.CharField(max_length=100, blank=True, default="")

    # Video metadata
    title = models.CharField(max_length=500, blank=True, default="")
    description = models.TextField(blank=True, default="")
    thumbnail = models.URLField(max_length=2000, blank=True, default="")
    duration = models.FloatField(null=True, blank=True, help_text="Duration in seconds")
    uploader = models.CharField(max_length=300, blank=True, default="")

    # Download configuration
    options = models.JSONField(default=dict, blank=True)

    # State
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    file_name = models.CharField(max_length=500, blank=True, default="")
    file_size = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.title or self.url} ({self.status})"
