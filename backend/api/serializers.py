from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
from django.utils import timezone
from .models import Product, Category, Review, Order, OrderItem, UserProfile, WishlistItem, Event

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