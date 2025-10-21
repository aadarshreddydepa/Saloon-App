from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from math import radians, cos, sin, asin, sqrt

from .models import BarberJoinRequest, Salon, Service, Barber, Booking, Payment, Review
from .serializers import (
    UserSerializer, UserProfileSerializer,
    SalonSerializer, SalonListSerializer, SalonCreateUpdateSerializer,
    ServiceSerializer, BarberSerializer, BarberListSerializer,
    BookingSerializer, BookingCreateSerializer, BookingUpdateSerializer,
    PaymentSerializer, PaymentCreateSerializer,
    ReviewSerializer, ReviewCreateSerializer,BarberSerializer, BarberDetailSerializer, BarberJoinRequestSerializer
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
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter bookings based on user type and query params"""
        user = self.request.user
        queryset = Booking.objects.all()
        
        # Filter by salon if provided
        salon_id = self.request.query_params.get('salon', None)
        if salon_id:
            queryset = queryset.filter(salon_id=salon_id)
        
        # Customer sees only their bookings
        if user.user_type == 'customer':
            queryset = queryset.filter(customer=user)
        
        # Barber sees all bookings for their salon
        elif user.user_type == 'barber':
            try:
                barber = user.barber_profile
                if barber.salon:
                    queryset = queryset.filter(salon=barber.salon)
            except:
                queryset = queryset.none()
        
        # Owner sees all bookings for their salons
        elif user.user_type == 'owner':
            queryset = queryset.filter(salon__owner=user)
        
        return queryset.order_by('-booking_date', '-booking_time')
    
    def create(self, request, *args, **kwargs):
        """Customer creates booking - barber is initially null"""
        if request.user.user_type != 'customer':
            return Response(
                {'error': 'Only customers can create bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['customer'] = request.user.id
        data['status'] = 'pending'
        data['barber'] = None  # No barber assigned initially
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Allow partial updates for:
        - Barber self-assignment (auto-confirms booking)
        - Status updates by assigned barber
        - Customer cancellation
        """
        instance = self.get_object()
        user = request.user
        
        # Check what's being updated
        barber_assignment = 'barber' in request.data
        status_update = 'status' in request.data
        
        # ===== BARBER SELF-ASSIGNMENT =====
        if barber_assignment and user.user_type == 'barber':
            try:
                barber = user.barber_profile
                
                # Check if barber works at this salon
                if instance.salon != barber.salon:
                    return Response(
                        {'error': 'You can only assign yourself to bookings in your salon'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Check if booking is still unassigned
                if instance.barber:
                    return Response(
                        {'error': 'This booking is already assigned to another barber'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check if booking is in valid status for assignment
                if instance.status not in ['pending']:
                    return Response(
                        {'error': 'Can only assign yourself to pending bookings'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # ✨ AUTO-CONFIRM when barber assigns themselves
                instance.barber = barber
                instance.status = 'confirmed'  # 👈 This is the key change!
                instance.save()
                
                serializer = self.get_serializer(instance)
                return Response({
                    'message': 'Booking assigned and confirmed',
                    'data': serializer.data
                })
                
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # ===== STATUS UPDATES =====
        if status_update:
            new_status = request.data.get('status')
            current_status = instance.status
            
            # Define who can update status
            can_update = False
            
            # Customer can only cancel
            if user == instance.customer and new_status == 'cancelled':
                can_update = True
            
            # Barber can update if assigned to them
            elif user.user_type == 'barber':
                try:
                    barber = user.barber_profile
                    if instance.barber == barber:
                        can_update = True
                except:
                    pass
            
            if not can_update:
                return Response(
                    {'error': 'You do not have permission to update this booking status'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Validate status transitions
            valid_transitions = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['in_progress', 'cancelled'],
                'in_progress': ['completed'],
                'completed': [],
                'cancelled': [],
            }
            
            if new_status not in valid_transitions.get(current_status, []):
                return Response(
                    {'error': f'Cannot change status from {current_status} to {new_status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Perform update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel booking - customer or assigned barber can cancel"""
        booking = self.get_object()
        user = request.user
        
        can_cancel = False
        
        if user == booking.customer:
            can_cancel = True
        elif user.user_type == 'barber':
            try:
                if booking.barber == user.barber_profile:
                    can_cancel = True
            except:
                pass
        
        if not can_cancel:
            return Response(
                {'error': 'You cannot cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {'error': 'Cannot cancel this booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
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
class BarberViewSet(viewsets.ModelViewSet):
    queryset = Barber.objects.all()
    serializer_class = BarberDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Barber.objects.all()
        salon_id = self.request.query_params.get('salon', None)
        if salon_id:
            queryset = queryset.filter(salon_id=salon_id)
        return queryset
    
    @action(detail=False, methods=['post'], url_path='join-request/(?P<salon_id>[^/.]+)')
    def send_join_request(self, request, salon_id=None):
        """Barber sends join request to a salon"""
        if request.user.user_type != 'barber':
            return Response(
                {'error': 'Only barbers can send join requests'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if barber already has a salon
        try:
            barber = Barber.objects.get(user=request.user)
            if barber.salon:
                return Response(
                    {'error': 'You are already assigned to a salon. Leave current salon first.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Barber.DoesNotExist:
            # Create barber profile if doesn't exist
            barber = Barber.objects.create(user=request.user)
        
        # Check if request already exists
        salon = get_object_or_404(Salon, id=salon_id)
        existing_request = BarberJoinRequest.objects.filter(
            barber=request.user,
            salon=salon,
            status='pending'
        ).first()
        
        if existing_request:
            return Response(
                {'error': 'You already have a pending request for this salon'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create join request
        join_request = BarberJoinRequest.objects.create(
            barber=request.user,
            salon=salon,
            message=request.data.get('message', '')
        )
        
        serializer = BarberJoinRequestSerializer(join_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='join-requests')
    def get_join_requests(self, request):
        """Owner gets join requests for their salons"""
        if request.user.user_type != 'owner':
            return Response(
                {'error': 'Only owners can view join requests'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        salon_id = request.query_params.get('salon')
        if not salon_id:
            return Response(
                {'error': 'Salon ID required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify salon belongs to this owner
        salon = get_object_or_404(Salon, id=salon_id, owner=request.user)
        
        requests = BarberJoinRequest.objects.filter(salon=salon, status='pending')
        serializer = BarberJoinRequestSerializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='approve-request/(?P<request_id>[^/.]+)')
    def approve_request(self, request, request_id=None):
        """Owner approves barber join request"""
        if request.user.user_type != 'owner':
            return Response(
                {'error': 'Only owners can approve requests'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        join_request = get_object_or_404(BarberJoinRequest, id=request_id)
        
        # Verify salon belongs to this owner
        if join_request.salon.owner != request.user:
            return Response(
                {'error': 'You can only approve requests for your own salons'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if barber already has a salon
        try:
            barber = Barber.objects.get(user=join_request.barber)
            if barber.salon:
                join_request.status = 'rejected'
                join_request.save()
                return Response(
                    {'error': 'Barber is already assigned to another salon'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Barber.DoesNotExist:
            barber = Barber.objects.create(user=join_request.barber)
        
        # Approve request and assign barber to salon
        join_request.status = 'approved'
        join_request.save()
        
        barber.salon = join_request.salon
        barber.save()
        
        return Response({
            'message': 'Barber approved and assigned to salon',
            'barber': BarberDetailSerializer(barber).data
        })
    
    @action(detail=False, methods=['post'], url_path='reject-request/(?P<request_id>[^/.]+)')
    def reject_request(self, request, request_id=None):
        """Owner rejects barber join request"""
        if request.user.user_type != 'owner':
            return Response(
                {'error': 'Only owners can reject requests'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        join_request = get_object_or_404(BarberJoinRequest, id=request_id)
        
        # Verify salon belongs to this owner
        if join_request.salon.owner != request.user:
            return Response(
                {'error': 'You can only reject requests for your own salons'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        join_request.status = 'rejected'
        join_request.save()
        
        return Response({'message': 'Request rejected'})
    
class SalonViewSet(viewsets.ModelViewSet):
    queryset = Salon.objects.all()
    serializer_class = SalonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'owner':
            return Salon.objects.filter(owner=user)
        return Salon.objects.filter(is_active=True)
    
    def partial_update(self, request, *args, **kwargs):
        """Allow PATCH updates for salon (like toggling is_active)"""
        instance = self.get_object()
        
        # Only owner can update their salon
        if instance.owner != request.user:
            return Response(
                {'error': 'You can only update your own salons'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Perform partial update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Allow PUT updates for salon"""
        instance = self.get_object()
        
        # Only owner can update their salon
        if instance.owner != request.user:
            return Response(
                {'error': 'You can only update your own salons'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete salon - only by owner"""
        instance = self.get_object()
        
        if instance.owner != request.user:
            return Response(
                {'error': 'You can only delete your own salons'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
