from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from math import radians, cos, sin, asin, sqrt

from .models import Salon, Service, Barber, Booking, Payment, Review
from .serializers import (
    UserSerializer, UserProfileSerializer,
    SalonSerializer, SalonListSerializer, SalonCreateUpdateSerializer,
    ServiceSerializer, BarberSerializer, BarberListSerializer,
    BookingSerializer, BookingCreateSerializer, BookingUpdateSerializer,
    PaymentSerializer, PaymentCreateSerializer,
    ReviewSerializer, ReviewCreateSerializer
)

User = get_user_model()


# User Registration and Profile
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get or update user profile"""
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Salon ViewSet
class SalonViewSet(viewsets.ModelViewSet):
    queryset = Salon.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'address', 'description']
    ordering_fields = ['rating', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SalonListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SalonCreateUpdateSerializer
        return SalonSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get salons near a specific location"""
        lat = request.query_params.get('latitude')
        lng = request.query_params.get('longitude')
        radius = float(request.query_params.get('radius', 10))  # Default 10 km
        
        if not lat or not lng:
            return Response(
                {"error": "latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lat = float(lat)
        lng = float(lng)
        
        # Calculate distance for each salon
        salons = []
        for salon in self.get_queryset():
            distance = self.calculate_distance(lat, lng, 
                                               float(salon.latitude), 
                                               float(salon.longitude))
            if distance <= radius:
                salon.distance = round(distance, 2)
                salons.append(salon)
        
        # Sort by distance
        salons.sort(key=lambda x: x.distance)
        
        serializer = SalonListSerializer(salons, many=True)
        return Response(serializer.data)
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return km


# Service ViewSet
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['salon', 'is_active']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]


# Barber ViewSet
class BarberViewSet(viewsets.ModelViewSet):
    queryset = Barber.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['salon', 'is_available']
    ordering_fields = ['rating', 'experience_years']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BarberListSerializer
        return BarberSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]


# Booking ViewSet
class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'salon', 'barber', 'booking_date']
    ordering_fields = ['booking_date', 'booking_time', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'customer':
            return Booking.objects.filter(customer=user)
        elif user.user_type == 'owner':
            return Booking.objects.filter(salon__owner=user)
        elif user.user_type == 'barber':
            return Booking.objects.filter(barber__user=user)
        return Booking.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        return BookingSerializer
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {"error": "Cannot cancel this booking"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark booking as completed"""
        booking = self.get_object()
        booking.status = 'completed'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)


# Payment ViewSet
class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'payment_method']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'customer':
            return Payment.objects.filter(booking__customer=user)
        elif user.user_type == 'owner':
            return Payment.objects.filter(booking__salon__owner=user)
        return Payment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a payment"""
        payment = self.get_object()
        payment.status = 'completed'
        payment.transaction_id = request.data.get('transaction_id', f'TXN{payment.id}')
        payment.save()
        serializer = self.get_serializer(payment)
        return Response(serializer.data)


# Review ViewSet
class ReviewViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['salon', 'barber', 'rating']
    ordering_fields = ['created_at', 'rating']
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.user_type == 'customer':
                return Review.objects.filter(customer=self.request.user)
            elif self.request.user.user_type == 'owner':
                return Review.objects.filter(salon__owner=self.request.user)
        return Review.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
