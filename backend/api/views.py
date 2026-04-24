import os
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission, SAFE_METHODS
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes

# Google Auth Imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Product, Category, Review, Order, OrderItem
from .serializers import (
    ProductSerializer, 
    CategorySerializer, 
    ReviewSerializer, 
    RegisterSerializer
)

# --- CUSTOM PERMISSIONS ---
class IsAdminOrReadOnly(BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

# --- 1. STORE VIEWS ---

class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

class DealList(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return Product.objects.filter(original_price__isnull=False)

class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


# --- 2. REVIEW VIEWS ---

class ReviewList(generics.ListCreateAPIView):
    """Handles listing reviews (limited to 6) and posting new ones"""
    serializer_class = ReviewSerializer
    # Anyone can see reviews, but only logged-in users can post
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        if product_id:
            # Return the latest 6 reviews for a specific product
            return Review.objects.filter(product_id=product_id).order_by('-created_at')[:6]
        return Review.objects.all()

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the author of the review
        serializer.save(user=self.request.user)

# --- 3. AUTHENTICATION & GOOGLE LOGIN ---

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Verifies Google ID Token and returns ShopWave JWTs"""
    token = request.data.get('token')
    
    try:
        # Verify the token against Google's servers
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        email = idinfo['email']
        
        # Find or create user. Google users are pre-verified.
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0], 
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
                'is_active': True 
            }
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "user": {"username": user.username, "email": user.email}
        }, status=status.HTTP_200_OK)

    except ValueError:
        return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verify_url = f"http://localhost:5173/verify-email/{uid}/{token}"

        send_mail(
            "Verify your ShopWave Account", 
            f"Hi {user.username},\n\nPlease verify your email:\n{verify_url}", 
            settings.DEFAULT_FROM_EMAIL, 
            [user.email]
        )
        return Response({"message": "Registration successful! Check your email."}, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except: user = None

        if user and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
                "message": "Verified!"
            }, status=200)
        return Response({"error": "Invalid link"}, status=400)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({"username": request.user.username, "email": request.user.email})

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        # Verify the old password first
        if not request.user.check_password(old_password):
            return Response({"error": "Incorrect current password."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the new password isn't empty
        if not new_password or len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        # Set and save the new password
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

# --- 4. CART MERGING ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merge_cart(request):
    user = request.user
    local_items = request.data.get('items', [])
    order, _ = Order.objects.get_or_create(user=user, status='pending')

    for item in local_items:
        try:
            product = Product.objects.get(id=item['id'])
            order_item, created = OrderItem.objects.get_or_create(
                order=order, product=product, defaults={'quantity': item['quantity']}
            )
            if not created:
                order_item.quantity += item['quantity']
                order_item.save()
        except: continue
    return Response({"message": "Merged"}, status=200)