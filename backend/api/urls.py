from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.ProductList.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetail.as_view(), name='product-detail'),
    path('deals/', views.DealList.as_view(), name='deal-list'),
    path('categories/', views.CategoryList.as_view(), name='category-list'),
    path('reviews/', views.ReviewList.as_view(), name='review-list'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('verify-email/<str:uidb64>/<str:token>/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('google-auth/', views.google_auth, name='google-auth'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('merge-cart/', views.merge_cart, name='merge-cart'),
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('orders/', views.OrderListAPIView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetailAPIView.as_view(), name='order-detail'),
    path('wishlist/', views.WishlistAPIView.as_view(), name='wishlist-list'),
    path('wishlist/<int:pk>/', views.WishlistDetailAPIView.as_view(), name='wishlist-detail'),

    # ── LIVESTREAM ────────────────────────────────────────────────────────────
    # Public status endpoint (polled by frontend useYouTube hook every 5 min)
    path('livestream/status/', views.livestream_status, name='livestream-status'),

    # Admin broadcast management
    path('livestream/broadcasts/', views.LiveStreamBroadcastListView.as_view(), name='broadcast-list'),
    path('livestream/broadcasts/<int:pk>/', views.LiveStreamBroadcastDetailView.as_view(), name='broadcast-detail'),
    path('livestream/broadcasts/<int:pk>/toggle/', views.toggle_live, name='broadcast-toggle'),
    path('livestream/broadcasts/<int:pk>/viewers/', views.update_viewer_count, name='broadcast-viewers'),

    # Comments (public read + post; admin moderation)
    path('livestream/broadcasts/<int:pk>/comments/', views.LiveStreamCommentListView.as_view(), name='broadcast-comments'),
    path('livestream/broadcasts/<int:pk>/sync-youtube/', views.sync_youtube_comments, name='broadcast-sync-youtube'),
    path('livestream/comments/', views.LiveStreamCommentAdminView.as_view(), name='comment-admin-list'),
    path('livestream/comments/<int:comment_id>/moderate/', views.moderate_comment, name='comment-moderate'),
    path('livestream/comments/<int:comment_id>/delete/', views.delete_comment, name='comment-delete'),
    # ─────────────────────────────────────────────────────────────────────────

    path('events/', views.EventList.as_view(), name='event-list'),
     path('events/active/', views.active_event, name='active-event'),
    path('events/<int:pk>/', views.EventDetail.as_view(), name='event-detail'),

    # --- TRAFFIC ROUTES ---
    path('track-visit/', views.track_visit, name='track-visit'),
    path('traffic-stats/', views.traffic_stats, name='traffic-stats'),
]