from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Salon, Service, Barber, Booking, Payment, Review


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'phone', 'is_staff']
    list_filter = ['user_type', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'profile_picture')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'profile_picture')}),
    )


@admin.register(Salon)
class SalonAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'phone', 'rating', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'address', 'phone']
    readonly_fields = ['rating', 'total_reviews', 'created_at']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'salon', 'price', 'duration', 'is_active']
    list_filter = ['is_active', 'salon']
    search_fields = ['name', 'salon__name']


@admin.register(Barber)
class BarberAdmin(admin.ModelAdmin):
    list_display = ['user', 'salon', 'specialization', 'experience_years', 'rating', 'is_available']
    list_filter = ['is_available', 'salon']
    search_fields = ['user__username', 'salon__name']
    readonly_fields = ['rating']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'salon', 'barber', 'booking_date', 'booking_time', 'status', 'created_at']
    list_filter = ['status', 'booking_date', 'created_at']
    search_fields = ['customer__username', 'salon__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'amount', 'payment_method', 'status', 'transaction_id', 'payment_date']
    list_filter = ['status', 'payment_method', 'payment_date']
    search_fields = ['transaction_id', 'booking__customer__username']
    readonly_fields = ['payment_date']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'salon', 'barber', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['customer__username', 'salon__name', 'comment']
    readonly_fields = ['created_at']
