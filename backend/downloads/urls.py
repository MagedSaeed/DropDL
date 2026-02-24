from django.urls import path

from . import views

urlpatterns = [
    path("extract-info/", views.ExtractInfoView.as_view(), name="extract-info"),
    path("download/", views.StreamDownloadView.as_view(), name="stream-download"),
    path("history/", views.DownloadHistoryView.as_view(), name="download-history"),
    path(
        "history/<uuid:download_id>/",
        views.DownloadHistoryDeleteView.as_view(),
        name="download-history-delete",
    ),
]
