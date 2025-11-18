from django import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    register_user, user_profile,
    SalonViewSet, ServiceViewSet, BarberViewSet,
    BookingViewSet, PaymentViewSet, ReviewViewSet
)
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'salons', SalonViewSet, basename='salon')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'barbers', BarberViewSet, basename='barber')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_user, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', user_profile, name='user_profile'),
    path('auth/change-password/', views.change_password, name='change_password'),
    # Include router URLs
    path('', include(router.urls)),
]
