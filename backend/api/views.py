import os
import stripe
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q, Avg, Value, FloatField, Count, Sum
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

from .models import (
    Product, Category, Review, Order, OrderItem,
    UserProfile, UserAddress, WishlistItem, Event, WebsiteVisit,
    LiveStreamBroadcast, LiveStreamComment
)
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    ReviewSerializer,
    RegisterSerializer,
    WishlistItemSerializer,
    EventSerializer,
    OrderSerializer,
    LiveStreamBroadcastSerializer,
    LiveStreamAdminSerializer,
    LiveStreamCommentSerializer,
)

# Initialize Stripe API Key (Make sure to add this to your core/settings.py)
stripe.api_key = getattr(settings, 'STRIPE_TEST_SECRET_KEY', 'sk_test_placeholder')

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class ProductList(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.annotate(
            calculated_rating=Coalesce(Avg('reviews__rating'), Value(0.0), output_field=FloatField()),
            sales_count=Coalesce(Sum('orderitem__quantity', filter=Q(orderitem__order__status__in=['processing', 'delivered'])), Value(0))
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
            try: queryset = queryset.filter(base_price__gte=float(min_price))
            except ValueError: pass
            
        if max_price:
            try: queryset = queryset.filter(base_price__lte=float(max_price))
            except ValueError: pass
            
        if rating:
            try: queryset = queryset.filter(calculated_rating__gte=float(rating))
            except ValueError: pass
            
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
        active_event = Event.objects.filter(is_active=True, end_date__gt=timezone.now()).first()
        if active_event:
            return Product.objects.filter(discount_percentage__gt=0)
        return Product.objects.none()

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

class EventList(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        expired_events = Event.objects.filter(is_active=True, end_date__lte=timezone.now())
        if expired_events.exists():
            expired_events.update(is_active=False)
            Product.objects.update(discount_percentage=0)
              
        return Event.objects.all().order_by('-id')

class EventDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_update(self, serializer):
        was_active = self.get_object().is_active
        updated_instance = serializer.save()
        
        if was_active and not updated_instance.is_active:
            Product.objects.update(discount_percentage=0)

@api_view(['GET'])
@permission_classes([AllowAny])
def active_event(request):
    expired_events = Event.objects.filter(is_active=True, end_date__lte=timezone.now())
    if expired_events.exists():
        expired_events.update(is_active=False)
        Product.objects.update(discount_percentage=0)

    event = Event.objects.filter(is_active=True, end_date__gt=timezone.now()).order_by('end_date').first()
    if event:
        return Response(EventSerializer(event).data)
    return Response({"error": "No active events"}, status=status.HTTP_404_NOT_FOUND)      

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
        
        user = User.objects.filter(email=email).first()
        
        if not user:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User.objects.create(
                email=email,
                username=username, 
                first_name=idinfo.get('given_name', ''),
                last_name=idinfo.get('family_name', ''),
                is_active=True 
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

        orders = Order.objects.filter(user=request.user).exclude(status='pending').order_by('-created_at')
        order_data = [{
            "id": f"SW-{o.id:04d}",
            "raw_id": o.id,
            "total_price": float(o.total_price),
            "status": o.status.capitalize(),
            "created_at": o.created_at.strftime('%B %d, %Y'),
            "items": sum(i.quantity for i in o.items.all())
        } for o in orders]
        
        return Response({
            "username": request.user.username, 
            "email": request.user.email,
            "profile_image": image_url,
            "is_staff": request.user.is_staff,
            "phone": profile.phone,
            "addresses": address_data,
            "orders": order_data
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
    
    order = Order.objects.filter(user=user, status='pending').first()
    if not order:
        order = Order.objects.create(user=user, status='pending', total_price=0.00, shipping_address='')

    if request.method == 'POST':
        local_items = request.data.get('items', [])
        action = request.data.get('action', 'merge')

        if action == 'sync':
            order.items.all().delete()
            for item in local_items:
                try:
                    product = Product.objects.get(id=item['id'])
                    base = float(product.base_price or 0)
                    active_event = Event.objects.filter(is_active=True, end_date__gt=timezone.now()).first()
                    discount = float(product.discount_percentage or 0) if active_event else 0.0
                    
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
                    active_event = Event.objects.filter(is_active=True, end_date__gt=timezone.now()).first()
                    discount = float(product.discount_percentage or 0) if active_event else 0.0
                    
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
            active_event = Event.objects.filter(is_active=True, end_date__gt=timezone.now()).first()
            discount = float(prod.discount_percentage or 0) if active_event else 0.0
            
            price = base
            if discount > 0:
                price = round(base - (base * discount / 100), 2)
                
            cart_data.append({
                'id': prod.id, 'name': prod.name, 'price': price,
                'original_price': base if discount > 0 else None,
                'discount_percentage': discount,
                'image': request.build_absolute_uri(prod.image.url) if prod.image and prod.image.name else None,
                'stock': prod.stock, 'quantity': order_item.quantity
            })

    return Response({"items": cart_data}, status=200)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        shipping_address = request.data.get('shipping_address', '')
        total_price = request.data.get('total_price', 0.00)
        payment_method = request.data.get('payment_method', '') # get the selected method
        
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'phone' in request.data: 
            profile.phone = request.data.get('phone', '')
            profile.save()

        try:
            order = Order.objects.get(user=user, status='pending')
            
            # 1. Stripe Sandbox Integration (No Cards)
            if payment_method == 'stripe_ach':
                intent = stripe.PaymentIntent.create(
                    amount=int(float(total_price) * 100), # Stripe expects amounts in cents
                    currency='usd',
                    payment_method_types=['us_bank_account'], # Explicitly omitting 'card'
                    metadata={'order_id': order.id}
                )

            # 2. Paystack Integration Space
            elif payment_method == 'paystack':
                pass # TODO: Implement Paystack initialization logic here

            # Update Order Status
            order.shipping_address = shipping_address
            order.total_price = total_price
            order.status = 'processing'
            order.created_at = timezone.now()
            order.save()
            
            return Response({"message": "Order placed successfully"}, status=status.HTTP_200_OK)
            
        except Order.DoesNotExist:
            return Response({"error": "No pending order found"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
    """
    Public endpoint polled by the frontend every 5 minutes via useYouTube.js.
    Returns the current live broadcast state from the database.
    """
    broadcast = LiveStreamBroadcast.objects.filter(is_live=True).first()
    if broadcast:
        return Response({
            "isLive": True,
            "videoId": broadcast.video_id,
            "title": broadcast.title,
            "description": broadcast.description,
            "broadcastId": broadcast.id,
            "viewerCount": broadcast.viewer_count,
            "event": {
                "id": broadcast.event.id,
                "name": broadcast.event.name,
            } if broadcast.event else None,
        }, status=200)
    return Response({
        "isLive": False,
        "videoId": None,
        "title": "No active stream",
        "description": "",
        "broadcastId": None,
        "viewerCount": 0,
        "event": None,
    }, status=200)


# ─── LIVESTREAM ADMIN VIEWS ──────────────────────────────────────────────────

class LiveStreamBroadcastListView(generics.ListCreateAPIView):
    """
    GET  /api/livestream/broadcasts/       — list all broadcasts (admin)
    POST /api/livestream/broadcasts/       — create new broadcast (admin)
    """
    queryset = LiveStreamBroadcast.objects.all()
    serializer_class = LiveStreamAdminSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()


class LiveStreamBroadcastDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/livestream/broadcasts/<id>/  — get broadcast details
    PATCH  /api/livestream/broadcasts/<id>/  — update (toggle is_live, etc.)
    DELETE /api/livestream/broadcasts/<id>/  — delete broadcast
    """
    queryset = LiveStreamBroadcast.objects.all()
    serializer_class = LiveStreamAdminSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_live(request, pk):
    """
    POST /api/livestream/broadcasts/<id>/toggle/
    Body: { "is_live": true/false }
    Convenience endpoint for the admin dashboard's go-live button.
    """
    if not request.user.is_staff:
        return Response({"detail": "Admin access required."}, status=403)
    try:
        broadcast = LiveStreamBroadcast.objects.get(pk=pk)
    except LiveStreamBroadcast.DoesNotExist:
        return Response({"detail": "Broadcast not found."}, status=404)

    go_live = request.data.get('is_live', not broadcast.is_live)
    broadcast.is_live = go_live
    broadcast.save()

    serializer = LiveStreamAdminSerializer(broadcast)
    return Response({
        "message": f"Stream is now {'LIVE 🔴' if go_live else 'OFFLINE ⚫'}",
        "broadcast": serializer.data
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_viewer_count(request, pk):
    """PATCH /api/livestream/broadcasts/<id>/viewers/ — update viewer count from admin."""
    if not request.user.is_staff:
        return Response({"detail": "Admin access required."}, status=403)
    try:
        broadcast = LiveStreamBroadcast.objects.get(pk=pk)
    except LiveStreamBroadcast.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)
    count = request.data.get('viewer_count', broadcast.viewer_count)
    broadcast.viewer_count = count
    broadcast.save(update_fields=['viewer_count'])
    return Response({"viewer_count": broadcast.viewer_count})


# ─── COMMENT VIEWS ──────────────────────────────────────────────────────────

class LiveStreamCommentListView(generics.ListCreateAPIView):
    """
    GET  /api/livestream/broadcasts/<id>/comments/  — get visible comments (public)
    POST /api/livestream/broadcasts/<id>/comments/  — post a comment (auth or guest with name)
    """
    serializer_class = LiveStreamCommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        broadcast_id = self.kwargs['pk']
        return LiveStreamComment.objects.filter(
            broadcast_id=broadcast_id,
            is_hidden=False
        ).select_related('user').order_by('-is_pinned', '-created_at')

    def perform_create(self, serializer):
        broadcast_id = self.kwargs['pk']
        try:
            broadcast = LiveStreamBroadcast.objects.get(pk=broadcast_id)
        except LiveStreamBroadcast.DoesNotExist:
            raise ValidationError({"broadcast": "Broadcast not found."})
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(broadcast=broadcast, user=user, source='site')


class LiveStreamCommentAdminView(generics.ListAPIView):
    """
    GET /api/livestream/comments/        — all comments including hidden (admin)
    Supports ?broadcast=<id> filter.
    """
    serializer_class = LiveStreamCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = LiveStreamComment.objects.all().select_related('user', 'broadcast')
        broadcast_id = self.request.query_params.get('broadcast')
        if broadcast_id:
            qs = qs.filter(broadcast_id=broadcast_id)
        return qs


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def moderate_comment(request, comment_id):
    """
    PATCH /api/livestream/comments/<id>/moderate/
    Body: { "is_hidden": true, "is_pinned": false, "is_highlighted": true }
    Admin moderation endpoint.
    """
    if not request.user.is_staff:
        return Response({"detail": "Admin access required."}, status=403)
    try:
        comment = LiveStreamComment.objects.get(pk=comment_id)
    except LiveStreamComment.DoesNotExist:
        return Response({"detail": "Comment not found."}, status=404)

    allowed_fields = ['is_hidden', 'is_pinned', 'is_highlighted']
    for field in allowed_fields:
        if field in request.data:
            setattr(comment, field, request.data[field])
    comment.save()
    return Response(LiveStreamCommentSerializer(comment).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    """DELETE /api/livestream/comments/<id>/delete/ — permanently delete a comment (admin)."""
    if not request.user.is_staff:
        return Response({"detail": "Admin access required."}, status=403)
    try:
        comment = LiveStreamComment.objects.get(pk=comment_id)
        comment.delete()
        return Response({"detail": "Comment deleted."}, status=204)
    except LiveStreamComment.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_youtube_comments(request, pk):
    """
    POST /api/livestream/broadcasts/<id>/sync-youtube/
    Pulls comments from the YouTube Data API v3 for the broadcast's video_id
    and saves them as LiveStreamComment objects with source='youtube'.
    Requires YOUTUBE_API_KEY in settings.py (or .env).
    """
    if not request.user.is_staff:
        return Response({"detail": "Admin access required."}, status=403)

    try:
        broadcast = LiveStreamBroadcast.objects.get(pk=pk)
    except LiveStreamBroadcast.DoesNotExist:
        return Response({"detail": "Broadcast not found."}, status=404)

    if not broadcast.video_id:
        return Response({"detail": "This broadcast has no YouTube video ID set."}, status=400)

    api_key = getattr(settings, 'YOUTUBE_API_KEY', None)
    if not api_key:
        return Response({
            "detail": "YOUTUBE_API_KEY is not configured in settings. Add it to your .env file."
        }, status=503)

    import urllib.request
    import json as json_lib

    url = (
        f"https://www.googleapis.com/youtube/v3/commentThreads"
        f"?part=snippet&videoId={broadcast.video_id}"
        f"&maxResults=100&order=time&key={api_key}"
    )

    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json_lib.loads(resp.read().decode())
    except Exception as e:
        return Response({"detail": f"YouTube API error: {str(e)}"}, status=502)

    imported = 0
    for item in data.get('items', []):
        snippet = item['snippet']['topLevelComment']['snippet']
        yt_id = item['snippet']['topLevelComment']['id']
        # Skip if already imported
        if LiveStreamComment.objects.filter(youtube_comment_id=yt_id).exists():
            continue
        LiveStreamComment.objects.create(
            broadcast=broadcast,
            display_name=snippet.get('authorDisplayName', 'YouTube User'),
            message=snippet.get('textDisplay', ''),
            source='youtube',
            youtube_comment_id=yt_id,
        )
        imported += 1

    return Response({
        "message": f"Synced {imported} new YouTube comment(s).",
        "total_in_response": len(data.get('items', [])),
        "new_imported": imported,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def track_visit(request):
    page_url = request.data.get('page_url', '/')
    
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0]
    else:
        ip_address = request.META.get('REMOTE_ADDR')

    user = request.user if request.user.is_authenticated else None
    
    WebsiteVisit.objects.create(
        ip_address=ip_address,
        page_url=page_url,
        user=user
    )
    return Response({"status": "logged"}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def traffic_stats(request):
    if not request.user.is_staff:
        return Response({"error": "Not authorized"}, status=403)
        
    now = timezone.now()
    last_24h = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    unique_ips = WebsiteVisit.objects.filter(visited_at__gte=last_24h).values('ip_address').distinct().count()
    
    top_page_qs = WebsiteVisit.objects.filter(visited_at__gte=last_24h).values('page_url').annotate(visit_count=Count('page_url')).order_by('-visit_count').first()
    top_page = top_page_qs['page_url'] if top_page_qs else "No activity yet"
    
    pending_orders = Order.objects.filter(status='processing').count()
    completed_orders = Order.objects.filter(status='delivered').count()
    
    revenue_today = Order.objects.filter(created_at__gte=last_24h, status__in=['processing', 'delivered']).aggregate(Sum('total_price'))['total_price__sum'] or 0.00
    revenue_weekly = Order.objects.filter(created_at__gte=week_ago, status__in=['processing', 'delivered']).aggregate(Sum('total_price'))['total_price__sum'] or 0.00
    revenue_monthly = Order.objects.filter(created_at__gte=month_ago, status__in=['processing', 'delivered']).aggregate(Sum('total_price'))['total_price__sum'] or 0.00
    
    return Response({
        "unique_ips": unique_ips,
        "top_page": top_page,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "revenue": revenue_today,
        "revenue_weekly": revenue_weekly,
        "revenue_monthly": revenue_monthly
    }, status=200)

class OrderListAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.exclude(status='pending').order_by('-created_at')
        return Order.objects.filter(user=self.request.user).exclude(status='pending').order_by('-created_at')

class OrderDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)