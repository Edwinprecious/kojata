# api/urls.py
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
    path('wishlist/', views.WishlistAPIView.as_view(), name='wishlist-list'),
    path('wishlist/<int:pk>/', views.WishlistDetailAPIView.as_view(), name='wishlist-detail'),
    
    # --- ADDED THIS LINE BELOW ---
    path('livestream/status/', views.livestream_status, name='livestream-status'),
]