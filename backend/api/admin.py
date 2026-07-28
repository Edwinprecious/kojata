from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import (
    Product, Category, Order, Review, Event, WebsiteVisit,
    LiveStreamBroadcast, LiveStreamComment
)

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Order)
admin.site.register(Review)

# Register the tracking models
admin.site.register(Event)
admin.site.register(WebsiteVisit)


# ─── LIVESTREAM ADMIN ────────────────────────────────────────────────────────

class LiveStreamCommentInline(admin.TabularInline):
    model = LiveStreamComment
    extra = 0
    fields = ('display_name', 'message', 'source', 'is_pinned', 'is_highlighted', 'is_hidden', 'created_at')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    show_change_link = True


@admin.register(LiveStreamBroadcast)
class LiveStreamBroadcastAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'live_status_badge', 'video_id_link',
        'event', 'viewer_count', 'started_at', 'ended_at', 'updated_at'
    )
    list_filter = ('is_live',)
    search_fields = ('title', 'video_id')
    readonly_fields = ('started_at', 'ended_at', 'created_at', 'updated_at', 'live_preview')
    inlines = [LiveStreamCommentInline]

    fieldsets = (
        ('🔴 Stream Control', {
            'fields': ('is_live', 'title', 'description'),
            'description': (
                'Toggle "Is live" to go live. '
                'Only one broadcast can be live at a time — activating this will deactivate any other live broadcast.'
            ),
        }),
        ('📺 YouTube', {
            'fields': ('video_id', 'live_preview'),
            'description': (
                'Paste the Video ID from your YouTube Studio stream URL. '
                'Example: if the URL is youtube.com/watch?v=abc123, enter "abc123".'
            ),
        }),
        ('🛍️ Flash Sale', {
            'fields': ('event',),
            'description': 'Link a Flash Sale Event. It will auto-activate when this stream goes live and auto-deactivate when it ends.',
        }),
        ('📊 Stats & Scheduling', {
            'fields': ('viewer_count', 'scheduled_at', 'started_at', 'ended_at'),
        }),
        ('🗓️ Record', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def live_status_badge(self, obj):
        if obj.is_live:
            return format_html(
                '<span style="background:#dc2626;color:white;padding:3px 10px;'
                'border-radius:20px;font-size:11px;font-weight:bold;">🔴 LIVE</span>'
            )
        return format_html(
            '<span style="background:#6b7280;color:white;padding:3px 10px;'
            'border-radius:20px;font-size:11px;">⚫ Offline</span>'
        )
    live_status_badge.short_description = "Status"

    def video_id_link(self, obj):
        if obj.video_id:
            url = f"https://www.youtube.com/watch?v={obj.video_id}"
            return format_html('<a href="{}" target="_blank">{}</a>', url, obj.video_id)
        return "—"
    video_id_link.short_description = "Video ID"

    def live_preview(self, obj):
        if obj.video_id:
            return format_html(
                '<iframe width="480" height="270" src="https://www.youtube.com/embed/{}" '
                'frameborder="0" allowfullscreen></iframe>',
                obj.video_id
            )
        return "No video ID set."
    live_preview.short_description = "Preview"

    actions = ['go_live', 'end_stream']

    def go_live(self, request, queryset):
        broadcast = queryset.first()
        if broadcast:
            broadcast.is_live = True
            broadcast.save()
            self.message_user(request, f'✅ "{broadcast.title}" is now LIVE.')
    go_live.short_description = "🔴 Go Live with selected broadcast"

    def end_stream(self, request, queryset):
        count = queryset.filter(is_live=True).count()
        queryset.filter(is_live=True).update(is_live=False, ended_at=timezone.now())
        self.message_user(request, f'⚫ Ended {count} stream(s).')
    end_stream.short_description = "⚫ End selected streams"


@admin.register(LiveStreamComment)
class LiveStreamCommentAdmin(admin.ModelAdmin):
    list_display = (
        'display_name', 'short_message', 'broadcast', 'source',
        'is_pinned', 'is_highlighted', 'is_hidden', 'created_at'
    )
    list_filter = ('source', 'is_pinned', 'is_highlighted', 'is_hidden', 'broadcast')
    search_fields = ('display_name', 'message')
    readonly_fields = ('created_at',)
    list_editable = ('is_pinned', 'is_highlighted', 'is_hidden')
    ordering = ('-created_at',)

    actions = ['pin_comments', 'hide_comments', 'unhide_comments', 'highlight_comments']

    def short_message(self, obj):
        return obj.message[:80] + ('…' if len(obj.message) > 80 else '')
    short_message.short_description = "Message"

    def pin_comments(self, request, queryset):
        queryset.update(is_pinned=True)
        self.message_user(request, f'📌 Pinned {queryset.count()} comment(s).')
    pin_comments.short_description = "📌 Pin selected comments"

    def hide_comments(self, request, queryset):
        queryset.update(is_hidden=True)
        self.message_user(request, f'🚫 Hidden {queryset.count()} comment(s).')
    hide_comments.short_description = "🚫 Hide selected comments"

    def unhide_comments(self, request, queryset):
        queryset.update(is_hidden=False)
        self.message_user(request, f'✅ Unhidden {queryset.count()} comment(s).')
    unhide_comments.short_description = "✅ Unhide selected comments"

    def highlight_comments(self, request, queryset):
        queryset.update(is_highlighted=True)
        self.message_user(request, f'⭐ Highlighted {queryset.count()} comment(s).')
    highlight_comments.short_description = "⭐ Highlight selected comments"