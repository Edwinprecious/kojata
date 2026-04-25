from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem, Review
from rest_framework.validators import UniqueValidator

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    price = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
        
    def get_price(self, obj):
        # Failsafe: Default to 0 if the database returns None
        base = obj.base_price or 0
        discount = obj.discount_percentage or 0
        
        if discount > 0:
            discount_amount = (base * discount) / 100
            return round(base - discount_amount, 2)
        return base

    def get_original_price(self, obj):
        # Failsafe: Default to 0 if the database returns None
        discount = obj.discount_percentage or 0
        if discount > 0:
            return obj.base_price or 0
        return None

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with this email already exists.")]
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=False  # User is inactive until email is confirmed
        )
        return user