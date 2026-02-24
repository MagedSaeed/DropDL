from django.contrib import admin

from .models import Download


@admin.register(Download)
class DownloadAdmin(admin.ModelAdmin):
    list_display = ("title", "url", "user", "status", "source_site", "created_at")
    list_filter = ("status", "source_site", "created_at")
    search_fields = ("title", "url", "user__email")
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("user",)
