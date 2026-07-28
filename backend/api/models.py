from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_percentage = models.PositiveIntegerField(default=0)
    stock = models.IntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    rating = models.FloatField(default=0)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('delivered', 'Delivered'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    shipping_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id}"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.product.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class WebsiteVisit(models.Model):
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    page_url = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    visited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Visit to {self.page_url} at {self.visited_at}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class UserAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.street}"


class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


# ─── LIVESTREAM MODELS ───────────────────────────────────────────────────────

class LiveStreamBroadcast(models.Model):
    """
    Single source of truth for the live stream state.
    Admins toggle is_live to start/end a broadcast.
    Only ONE broadcast should have is_live=True at a time — enforced in save().
    """
    video_id = models.CharField(
        max_length=50,
        blank=True,
        help_text="YouTube video ID (e.g. dQw4w9WgXcQ). Find it in the YouTube Studio stream URL."
    )
    title = models.CharField(max_length=255, default="Live Show")
    description = models.TextField(blank=True)
    is_live = models.BooleanField(
        default=False,
        help_text="Toggle ON to make this the active broadcast. Only one stream can be live at a time."
    )
    viewer_count = models.PositiveIntegerField(default=0)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    event = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='livestreams',
        help_text="Optional: link to a Flash Sale Event. When this stream goes live, that event activates automatically."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Livestream Broadcast"
        verbose_name_plural = "Livestream Broadcasts"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        from django.utils import timezone
        # Enforce: only one live broadcast at a time
        if self.is_live:
            LiveStreamBroadcast.objects.exclude(pk=self.pk).filter(is_live=True).update(
                is_live=False,
                ended_at=timezone.now()
            )
            if not self.started_at:
                self.started_at = timezone.now()
            # Auto-activate linked event
            if self.event:
                self.event.is_active = True
                self.event.save(update_fields=['is_active'])
        else:
            # If going offline, record ended_at and deactivate event
            if self.pk:
                try:
                    old = LiveStreamBroadcast.objects.get(pk=self.pk)
                    if old.is_live and not self.is_live:
                        self.ended_at = timezone.now()
                        if self.event:
                            self.event.is_active = False
                            self.event.save(update_fields=['is_active'])
                except LiveStreamBroadcast.DoesNotExist:
                    pass
        super().save(*args, **kwargs)

    def __str__(self):
        status = "🔴 LIVE" if self.is_live else "⚫ Offline"
        return f"{status} — {self.title}"


class LiveStreamComment(models.Model):
    """
    Comments posted on the live stream page.
    Supports both native ShopWave site comments and mirrored YouTube comments.
    """
    SOURCE_CHOICES = [
        ('site', 'ShopWave Site'),
        ('youtube', 'YouTube'),
    ]

    broadcast = models.ForeignKey(
        LiveStreamBroadcast,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='livestream_comments'
    )
    display_name = models.CharField(max_length=100)
    message = models.TextField()
    is_pinned = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False, help_text="Hidden comments are not shown to viewers")
    is_highlighted = models.BooleanField(default=False)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='site')
    youtube_comment_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Livestream Comment"
        verbose_name_plural = "Livestream Comments"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # If pinning this comment, unpin all others on the same broadcast
        if self.is_pinned:
            LiveStreamComment.objects.filter(
                broadcast=self.broadcast, is_pinned=True
            ).exclude(pk=self.pk).update(is_pinned=False)
        super().save(*args, **kwargs)

    def __str__(self):
        flags = []
        if self.is_pinned:
            flags.append("📌")
        if self.is_hidden:
            flags.append("🚫")
        if self.is_highlighted:
            flags.append("⭐")
        return f"{''.join(flags)} [{self.source}] {self.display_name}: {self.message[:60]}"