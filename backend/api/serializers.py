from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
from .models import Product, Category, Review, Order, OrderItem, UserProfile, WishlistItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    price = serializers.SerializerMethodField()
    original_price = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2, read_only=True)
    
    # Add a dynamic method field to always calculate the true rating
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_price(self, obj):
        base = float(obj.base_price)
        discount = obj.discount_percentage
        if discount and discount > 0:
            return round(base - (base * (discount / 100.0)), 2)
        return base

    # Dynamically compute the average rating from actual reviews
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

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

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