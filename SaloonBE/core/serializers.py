from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from datetime import datetime, timedelta
from .models import BarberJoinRequest, Salon, Service, Barber, Booking, Payment, Review

User = get_user_model()


# ============ USER SERIALIZERS ============

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone',
            'user_type',
            'profile_picture',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
            'user_type': {'required': True},
        }
    
    def validate_username(self, value):
        """Validate username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value.lower()
    
    def validate_email(self, value):
        """Validate email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value.lower()
    
    def create(self, validated_data):
        """Create user with hashed password"""
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            user_type=validated_data.get('user_type', 'customer'),
            profile_picture=validated_data.get('profile_picture', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (read/update profile)"""
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone',
            'user_type',
            'profile_picture',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'username', 'user_type', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'user_type', 'phone', 'profile_picture']
        read_only_fields = ['id', 'user_type']


# ============ SALON SERIALIZERS ============

class SalonSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Salon
        fields = [
            'id', 'owner', 'owner_name', 'name', 'description', 
            'address', 'latitude', 'longitude', 'phone',
            'opening_time', 'closing_time', 'rating', 
            'total_reviews', 'is_active', 'created_at',
            'cover_image', 'gallery_images'
        ]
        read_only_fields = ['rating', 'total_reviews', 'created_at', 'owner_name']


class SalonListSerializer(serializers.ModelSerializer):
    distance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Salon
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'phone', 
                  'rating', 'total_reviews', 'cover_image', 'is_active', 'distance']


class SalonCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salon
        fields = ['name', 'description', 'address', 'latitude', 'longitude', 
                  'phone', 'opening_time', 'closing_time', 'cover_image', 'gallery_images', 'is_active']


# ============ SERVICE SERIALIZERS ============

class ServiceSerializer(serializers.ModelSerializer):
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'salon', 'salon_name', 'name', 'description',
            'price', 'duration', 'is_active', 'image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'salon_name', 'updated_at']


# ============ BARBER SERIALIZERS ============

class BarberListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Barber
        fields = ['id', 'user_name', 'specialization', 'experience_years', 
                  'rating', 'is_available']


class BarberSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Barber
        fields = ['id', 'user', 'user_id', 'salon', 'specialization', 
                  'experience_years', 'rating', 'is_available']
        read_only_fields = ['id', 'rating']


class BarberDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Barber
        fields = ['id', 'user', 'user_id', 'user_name', 'user_username', 'salon', 'salon_name', 'specialization', 'experience_years', 'rating', 'is_available', 'created_at']
        read_only_fields = ['rating', 'created_at']


class BarberJoinRequestSerializer(serializers.ModelSerializer):
    barber_name = serializers.CharField(source='barber.get_full_name', read_only=True)
    barber_username = serializers.CharField(source='barber.username', read_only=True)
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    
    class Meta:
        model = BarberJoinRequest
        fields = ['id', 'barber', 'barber_name', 'barber_username', 'salon', 'salon_name', 'message', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at']


# ============ BOOKING SERIALIZERS ============

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
        if data.get('barber') and data.get('salon'):
            if data['barber'].salon != data['salon']:
                raise serializers.ValidationError("Selected barber does not work at this salon.")
        return data
    
    def validate_booking_date(self, value):
        """✅ Validate booking date is not in the past"""
        if isinstance(value, str):
            try:
                booking_date = datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError:
                raise serializers.ValidationError("Invalid date format. Use YYYY-MM-DD")
        else:
            booking_date = value
        
        today = datetime.now().date()
        if booking_date < today:
            raise serializers.ValidationError("Cannot book appointments in the past")
        
        return value
    
    def validate_booking_time(self, value):
        """✅ Validate booking time format"""
        if isinstance(value, str):
            try:
                datetime.strptime(value, "%H:%M")
            except ValueError:
                raise serializers.ValidationError("Invalid time format. Use HH:MM")
        
        return value
    
    def validate(self, data):
        """✅ Validate booking is at least 30 minutes from now"""
        booking_date = data.get('booking_date')
        booking_time = data.get('booking_time')
        
        if not booking_date or not booking_time:
            return data
        
        try:
            booking_datetime = datetime.strptime(
                f"{booking_date} {booking_time}",
                "%Y-%m-%d %H:%M"
            )
        except (ValueError, TypeError):
            raise serializers.ValidationError("Invalid date or time format")
        
        now = datetime.now()
        if booking_datetime <= now:
            raise serializers.ValidationError("Cannot book appointments in the past")
        
        min_booking_time = now + timedelta(minutes=30)
        if booking_datetime < min_booking_time:
            raise serializers.ValidationError("Please book at least 30 minutes in advance")
        
        # Parent validation for barber
        if data.get('barber') and data.get('salon'):
            if data['barber'].salon != data['salon']:
                raise serializers.ValidationError("Selected barber does not work at this salon.")
        
        return data


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status', 'barber', 'booking_date', 'booking_time', 'notes']


# ============ PAYMENT SERIALIZERS ============

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
        if Payment.objects.filter(booking=value).exists():
            raise serializers.ValidationError("Payment already exists for this booking.")
        return value


# ============ REVIEW SERIALIZERS ============

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
        if value.status != 'completed':
            raise serializers.ValidationError("Can only review completed bookings.")
        
        if Review.objects.filter(booking=value).exists():
            raise serializers.ValidationError("Review already exists for this booking.")
        
        return value
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
#=========== CHANGE PASSWORD SERIALIZERS ============
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value
    
    def validate(self, attrs):
        if attrs.get('old_password') == attrs.get('new_password'):
            raise serializers.ValidationError({
                "new_password": "New password cannot be the same as current password"
            })
        return attrs