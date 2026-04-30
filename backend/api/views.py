import os
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

# --- NEW IMPORTS FOR DYNAMIC RATING FILTERING ---
from django.db.models import Q, Avg, Value, FloatField
from django.db.models.functions import Coalesce

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission, SAFE_METHODS
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Product, Category, Review, Order, OrderItem, UserProfile, UserAddress, WishlistItem
from .serializers import (
    ProductSerializer, 
    CategorySerializer, 
    ReviewSerializer, 
    RegisterSerializer,
    WishlistItemSerializer
)

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class ProductList(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        # 1. Annotate each product with a real-time 'calculated_rating' 
        # based on actual reviews. If there are no reviews, default to 0.0.
        queryset = Product.objects.annotate(
            calculated_rating=Coalesce(Avg('reviews__rating'), Value(0.0), output_field=FloatField())
        )
        
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        rating = self.request.query_params.get('rating', None)
        in_stock = self.request.query_params.get('in_stock', None)

        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        
        if category and category.lower() != 'all':
            queryset = queryset.filter(category__name__iexact=category)

        if min_price:
            try:
                queryset = queryset.filter(base_price__gte=float(min_price))
            except ValueError:
                pass
                
        if max_price:
            try:
                queryset = queryset.filter(base_price__lte=float(max_price))
            except ValueError:
                pass
                
        if rating:
            try:
                # 2. Filter using the new 'calculated_rating' instead of the static column
                queryset = queryset.filter(calculated_rating__gte=float(rating))
            except ValueError:
                pass
                
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)

        return queryset.order_by('-id')

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

class DealList(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Product.objects.filter(discount_percentage__gt=0)

class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class ReviewList(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        if product_id:
            return Review.objects.filter(product_id=product_id).order_by('-created_at')
        return Review.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data['product']
        
        has_purchased = OrderItem.objects.filter(order__user=user, product=product).exists()
        if not has_purchased:
            raise ValidationError({"error": "You can only review products you have previously purchased."})
            
        if Review.objects.filter(user=user, product=product).exists():
            raise ValidationError({"error": "You have already reviewed this product."})

        serializer.save(user=user, verified=True)
        
        avg_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']
        if avg_rating is not None:
            product.rating = round(avg_rating, 1)
            product.save()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    token = request.data.get('token')
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        email = idinfo['email']
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
            "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
            "user": {"username": user.username, "email": user.email, "is_staff": user.is_staff}
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
            "Verify your Account", 
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
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        image_url = request.build_absolute_uri(profile.profile_image.url) if profile.profile_image else None
        
        addresses = UserAddress.objects.filter(user=request.user).order_by('-created_at')
        address_data = [{
            "id": addr.id,
            "street": addr.street,
            "city": addr.city,
            "state": addr.state,
            "country": addr.country,
            "zip": addr.postal_code
        } for addr in addresses]
        
        return Response({
            "username": request.user.username, 
            "email": request.user.email,
            "profile_image": image_url,
            "is_staff": request.user.is_staff,
            "phone": profile.phone,
            "addresses": address_data
        })
        
    def patch(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        if 'profile_image' in request.FILES:
            profile.profile_image = request.FILES['profile_image']
            
        data = request.data
        if 'phone' in data: profile.phone = data.get('phone', '')
        
        if data.get('action') == 'add_address':
            UserAddress.objects.create(
                user=request.user,
                street=data.get('street', ''),
                city=data.get('city', ''),
                state=data.get('state', ''),
                postal_code=data.get('postal_code', ''),
                country=data.get('country', '')
            )
        elif data.get('action') == 'remove_address':
            addr_id = data.get('address_id')
            UserAddress.objects.filter(id=addr_id, user=request.user).delete()
            
        profile.save()
        
        addresses = UserAddress.objects.filter(user=request.user).order_by('-created_at')
        address_data = [{
            "id": addr.id,
            "street": addr.street,
            "city": addr.city,
            "state": addr.state,
            "country": addr.country,
            "zip": addr.postal_code
        } for addr in addresses]

        image_url = request.build_absolute_uri(profile.profile_image.url) if profile.profile_image else None
        return Response({"message": "Profile updated", "profile_image": image_url, "addresses": address_data}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not request.user.check_password(old_password):
            return Response({"error": "Incorrect current password."}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password or len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def merge_cart(request):
    user = request.user
    
    order, created = Order.objects.get_or_create(
        user=user, 
        status='pending', 
        defaults={'total_price': 0.00, 'shipping_address': ''}
    )

    if request.method == 'POST':
        local_items = request.data.get('items', [])
        action = request.data.get('action', 'merge')

        if action == 'sync':
            order.items.all().delete()
            for item in local_items:
                try:
                    product = Product.objects.get(id=item['id'])
                    base = float(product.base_price or 0)
                    discount = float(product.discount_percentage or 0)
                    price = base
                    if discount > 0:
                        price = round(base - (base * discount / 100), 2)
                        
                    OrderItem.objects.create(
                        order=order, product=product, quantity=item['quantity'], price_at_purchase=price
                    )
                except Exception as e: continue
        else:
            for item in local_items:
                try:
                    product = Product.objects.get(id=item['id'])
                    base = float(product.base_price or 0)
                    discount = float(product.discount_percentage or 0)
                    price = base
                    if discount > 0:
                        price = round(base - (base * discount / 100), 2)

                    order_item, item_created = OrderItem.objects.get_or_create(
                        order=order, product=product, defaults={'quantity': item['quantity'], 'price_at_purchase': price}
                    )
                    if not item_created:
                        order_item.quantity += item['quantity']
                        order_item.save()
                except Exception as e: continue

    cart_data = []
    for order_item in order.items.all():
        if order_item.product:
            prod = order_item.product
            base = float(prod.base_price or 0)
            discount = float(prod.discount_percentage or 0)
            price = base
            if discount > 0:
                price = round(base - (base * discount / 100), 2)
                
            cart_data.append({
                'id': prod.id, 'name': prod.name, 'price': price,
                'original_price': base if discount > 0 else None,
                'discount_percentage': discount,
                'image': request.build_absolute_uri(prod.image.url) if prod.image else None,
                'stock': prod.stock, 'quantity': order_item.quantity
            })

    return Response({"items": cart_data}, status=200)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        shipping_address = request.data.get('shipping_address', '')
        total_price = request.data.get('total_price', 0.00)
        
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'phone' in request.data: 
            profile.phone = request.data.get('phone', '')
            profile.save()

        try:
            order = Order.objects.get(user=user, status='pending')
            order.shipping_address = shipping_address
            order.total_price = total_price
            order.status = 'processing'
            order.save()
            return Response({"message": "Order placed successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "No pending order found"}, status=status.HTTP_400_BAD_REQUEST)

class WishlistAPIView(generics.ListCreateAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).order_by('-added_at')

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            product = Product.objects.get(id=product_id)
            wishlist_item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
            serializer = self.get_serializer(wishlist_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

class WishlistDetailAPIView(generics.DestroyAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([AllowAny])
def livestream_status(request):
    return Response({
        "isLive": False,
        "videoId": None,
        "title": "No active stream"
    }, status=200)