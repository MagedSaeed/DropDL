"""Root URL configuration for dropdl project."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/", include("core.urls")),
    path("api/", include("downloads.urls")),
]
