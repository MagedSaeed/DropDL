from unittest.mock import patch

import pytest
from django.test import Client

from core.tests.factories import UserFactory
from downloads.models import Download


@pytest.fixture
def user():
    return UserFactory()


@pytest.fixture
def authenticated_client(user):
    client = Client()
    client.force_login(user)
    return client


def _fake_stream_download(url, options):
    """Return a minimal generator, filename, and content_type."""

    def gen():
        yield b"data"

    return gen(), "video.mp4", "video/mp4"


@pytest.mark.django_db
class TestDownloadHistoryDeduplication:
    """Downloading the same URL twice should update the existing record."""

    DOWNLOAD_URL = "https://www.youtube.com/watch?v=abc123"

    def _do_download(self, client, url=None, title="Test Video"):
        return client.get(
            "/api/download/",
            {
                "url": url or self.DOWNLOAD_URL,
                "title": title,
                "source_site": "YouTube",
            },
        )

    @patch("downloads.views.stream_download", side_effect=_fake_stream_download)
    def test_first_download_creates_record(self, mock_dl, authenticated_client, user):
        self._do_download(authenticated_client)
        assert Download.objects.filter(user=user).count() == 1
        record = Download.objects.get(user=user)
        assert record.download_count == 1

    @patch("downloads.views.stream_download", side_effect=_fake_stream_download)
    def test_second_download_increments_count(self, mock_dl, authenticated_client, user):
        self._do_download(authenticated_client)
        self._do_download(authenticated_client)
        assert Download.objects.filter(user=user).count() == 1
        record = Download.objects.get(user=user)
        assert record.download_count == 2

    @patch("downloads.views.stream_download", side_effect=_fake_stream_download)
    def test_different_urls_create_separate_records(self, mock_dl, authenticated_client, user):
        self._do_download(authenticated_client, url="https://example.com/a")
        self._do_download(authenticated_client, url="https://example.com/b")
        assert Download.objects.filter(user=user).count() == 2

    @patch("downloads.views.stream_download", side_effect=_fake_stream_download)
    def test_redownload_updates_metadata(self, mock_dl, authenticated_client, user):
        self._do_download(authenticated_client, title="Old Title")
        self._do_download(authenticated_client, title="New Title")
        record = Download.objects.get(user=user)
        assert record.title == "New Title"
        assert record.download_count == 2

    @patch("downloads.views.stream_download", side_effect=_fake_stream_download)
    def test_redownload_updates_last_downloaded_at(self, mock_dl, authenticated_client, user):
        self._do_download(authenticated_client)
        first_time = Download.objects.get(user=user).last_downloaded_at
        self._do_download(authenticated_client)
        second_time = Download.objects.get(user=user).last_downloaded_at
        assert second_time >= first_time


@pytest.mark.django_db
class TestDownloadHistoryView:
    def test_history_requires_auth(self):
        client = Client()
        response = client.get("/api/history/")
        assert response.status_code == 403

    def test_history_returns_download_count(self, authenticated_client, user):
        Download.objects.create(
            user=user,
            url="https://example.com/video",
            title="Test",
            download_count=3,
        )
        response = authenticated_client.get("/api/history/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["download_count"] == 3
        assert "last_downloaded_at" in data[0]

    def test_history_ordered_by_last_downloaded_at(self, authenticated_client, user):
        import datetime

        from django.utils import timezone

        now = timezone.now()
        Download.objects.create(
            user=user,
            url="https://example.com/old",
            title="Old",
            last_downloaded_at=now - datetime.timedelta(days=1),
        )
        Download.objects.create(
            user=user,
            url="https://example.com/new",
            title="New",
            last_downloaded_at=now,
        )
        response = authenticated_client.get("/api/history/")
        data = response.json()
        assert data[0]["title"] == "New"
        assert data[1]["title"] == "Old"
