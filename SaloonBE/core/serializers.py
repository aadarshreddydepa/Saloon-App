from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import BarberJoinRequest, Salon, Service, Barber, Booking, Payment, Review

User = get_user_model()


# User Serializers
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 
                  'user_type', 'phone', 'profile_picture', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'user_type', 'phone', 'profile_picture']
        read_only_fields = ['id', 'user_type']


# Service Serializer
class ServiceSerializer(serializers.ModelSerializer):
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'salon', 'salon_name', 'name', 'description',
            'price', 'duration', 'is_active', 'created_at',
            'image' ,'created_at','updated_at'# NEW field
        ]
        read_only_fields = ['created_at', 'salon_name','updated_at']

# Barber Serializer
class BarberSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Barber
        fields = ['id', 'user', 'user_id', 'salon', 'specialization', 
                  'experience_years', 'rating', 'is_available']
        read_only_fields = ['id', 'rating']


class BarberListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Barber
        fields = ['id', 'user_name', 'specialization', 'experience_years', 
                  'rating', 'is_available']


# Salon Serializers
class SalonSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    barbers = BarberListSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Salon
        fields = ['id', 'owner', 'owner_name', 'name', 'description', 'address', 
                  'latitude', 'longitude', 'phone', 'opening_time', 'closing_time', 
                  'rating', 'total_reviews', 'image', 'is_active', 'created_at',
                  'services', 'barbers']
        read_only_fields = ['id', 'rating', 'total_reviews', 'created_at']


class SalonListSerializer(serializers.ModelSerializer):
    distance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Salon
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'phone', 
                  'rating', 'total_reviews', 'image', 'is_active', 'distance']


class SalonCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salon
        fields = ['name', 'description', 'address', 'latitude', 'longitude', 
                  'phone', 'opening_time', 'closing_time', 'image', 'is_active']


# Booking Serializers
class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=10, decimal_places=2, read_only=True)
    barber_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'customer_name', 'salon', 'salon_name', 
            'service', 'service_name', 'service_price', 'barber', 'barber_name',
            'booking_date', 'booking_time', 'status', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_barber_name(self, obj):
        if obj.barber:
            return obj.barber.user.get_full_name() or obj.barber.user.username
        return None

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['salon', 'barber', 'service', 'booking_date', 'booking_time', 'notes']
    
    def validate(self, data):
        # Add custom validation logic here
        # Example: Check if barber belongs to the salon
        if data.get('barber') and data.get('salon'):
            if data['barber'].salon != data['salon']:
                raise serializers.ValidationError("Selected barber does not work at this salon.")
        return data


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status', 'barber', 'booking_date', 'booking_time', 'notes']


# Payment Serializers
class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'booking_details', 'amount', 'payment_method', 
                  'status', 'transaction_id', 'payment_date']
        read_only_fields = ['id', 'payment_date', 'transaction_id']


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['booking', 'amount', 'payment_method']
    
    def validate_booking(self, value):
        # Check if payment already exists for this booking
        if Payment.objects.filter(booking=value).exists():
            raise serializers.ValidationError("Payment already exists for this booking.")
        return value


# Review Serializers
class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    customer_photo = serializers.ImageField(source='customer.profile_picture', read_only=True)
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    barber_name = serializers.CharField(source='barber.user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'booking', 'customer', 'customer_name', 'customer_photo',
                  'salon', 'salon_name', 'barber', 'barber_name', 'rating', 
                  'comment', 'created_at']
        read_only_fields = ['id', 'created_at', 'customer']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['booking', 'salon', 'barber', 'rating', 'comment']
    
    def validate_booking(self, value):
        # Check if booking is completed
        if value.status != 'completed':
            raise serializers.ValidationError("Can only review completed bookings.")
        
        # Check if review already exists
        if Review.objects.filter(booking=value).exists():
            raise serializers.ValidationError("Review already exists for this booking.")
        
        return value
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
class BarberJoinRequestSerializer(serializers.ModelSerializer):
    barber_name = serializers.CharField(source='barber.get_full_name', read_only=True)
    barber_username = serializers.CharField(source='barber.username', read_only=True)
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    
    class Meta:
        model = BarberJoinRequest
        fields = ['id', 'barber', 'barber_name', 'barber_username', 'salon', 'salon_name', 'message', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at']

class BarberDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Barber
        fields = ['id', 'user', 'user_id', 'user_name', 'user_username', 'salon', 'salon_name', 'specialization', 'experience_years', 'rating', 'is_available', 'created_at']
        read_only_fields = ['rating', 'created_at']
class SalonSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Salon
        fields = [
            'id', 'owner', 'owner_name', 'name', 'description', 
            'address', 'latitude', 'longitude', 'phone',
            'opening_time', 'closing_time', 'rating', 
            'total_reviews', 'is_active', 'created_at',
            'cover_image', 'gallery_images'  # NEW fields
        ]
        read_only_fields = ['rating', 'total_reviews', 'created_at', 'owner_name']

# Update existing serializers to include image fields

class SalonSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Salon
        fields = [
            'id', 'owner', 'owner_name', 'name', 'description', 
            'address', 'latitude', 'longitude', 'phone',
            'opening_time', 'closing_time', 'rating', 
            'total_reviews', 'is_active', 'created_at',
            'cover_image', 'gallery_images'  # NEW fields
        ]
        read_only_fields = ['rating', 'total_reviews', 'created_at', 'owner_name']

class ServiceSerializer(serializers.ModelSerializer):
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'salon', 'salon_name', 'name', 'description',
            'price', 'duration', 'is_active', 'created_at',
            'image'  # NEW field
        ]
        read_only_fields = ['created_at', 'salon_name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'user_type', 'profile_picture'  # NEW field
        ]
        read_only_fields = ['id', 'username', 'user_type']
