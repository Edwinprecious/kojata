from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
from django.utils import timezone
from .models import (
    Product, Category, Review, Order, OrderItem,
    UserProfile, WishlistItem, Event,
    LiveStreamBroadcast, LiveStreamComment
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    original_price = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2, read_only=True)
    sales_count = serializers.IntegerField(read_only=True, required=False)

    price = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_discount_percentage(self, obj):
        active_event = Event.objects.filter(is_active=True, end_date__gt=timezone.now()).first()
        if active_event:
            return obj.discount_percentage
        return 0

    def get_price(self, obj):
        base = float(obj.base_price)
        discount = self.get_discount_percentage(obj)
        if discount and discount > 0:
            return round(base - (base * (discount / 100.0)), 2)
        return base

    def get_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'verified']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=False
        )
        return user


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'user', 'product', 'added_at']
        read_only_fields = ['user']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

    def validate(self, data):
        is_active = data.get('is_active', getattr(self.instance, 'is_active', False))
        end_date = data.get('end_date', getattr(self.instance, 'end_date', None))
        if is_active and end_date and end_date <= timezone.now():
            raise serializers.ValidationError(
                {"is_active": "Cannot activate an event that has already ended. Please extend the end date first."}
            )
        return data


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price_at_purchase']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    formatted_id = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'formatted_id', 'total_price', 'status', 'shipping_address', 'created_at', 'items']

    def get_formatted_id(self, obj):
        return f"SW-{obj.id:04d}"


# ─── LIVESTREAM SERIALIZERS ──────────────────────────────────────────────────

class LiveStreamCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # required=False so auth'd users don't need to send it (set server-side in validate).
    # allow_blank=False matches the model's no-blank constraint on display_name.
    display_name = serializers.CharField(required=False, allow_blank=False, max_length=100)
    message = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = LiveStreamComment
        fields = [
            'id', 'broadcast', 'user', 'display_name', 'message',
            'is_pinned', 'is_highlighted', 'is_hidden',
            'source', 'youtube_comment_id', 'created_at'
        ]
        read_only_fields = ['broadcast', 'user', 'is_pinned', 'is_highlighted', 'is_hidden', 'source', 'youtube_comment_id', 'created_at']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        if user and user.is_authenticated:
            # Always derive display_name from the authenticated user
            data['display_name'] = user.get_full_name() or user.username
        elif not data.get('display_name', '').strip():
            raise serializers.ValidationError(
                {'display_name': 'A display name is required for guest comments.'}
            )

        if not data.get('message', '').strip():
            raise serializers.ValidationError(
                {'message': 'Message cannot be empty.'}
            )

        return data


class LiveStreamBroadcastSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(), source='event', write_only=True, required=False, allow_null=True
    )
    comment_count = serializers.SerializerMethodField()
    pinned_comment = serializers.SerializerMethodField()

    class Meta:
        model = LiveStreamBroadcast
        fields = [
            'id', 'video_id', 'title', 'description', 'is_live',
            'viewer_count', 'scheduled_at', 'started_at', 'ended_at',
            'event', 'event_id', 'comment_count', 'pinned_comment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['started_at', 'ended_at', 'created_at', 'updated_at']

    def get_comment_count(self, obj):
        return obj.comments.filter(is_hidden=False).count()

    def get_pinned_comment(self, obj):
        pinned = obj.comments.filter(is_pinned=True, is_hidden=False).first()
        if pinned:
            return LiveStreamCommentSerializer(pinned).data
        return None


class LiveStreamAdminSerializer(serializers.ModelSerializer):
    """Full serializer for admin use — includes write access to is_live."""
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(), source='event', required=False, allow_null=True
    )

    class Meta:
        model = LiveStreamBroadcast
        fields = '__all__'
        read_only_fields = ['started_at', 'ended_at', 'created_at', 'updated_at']