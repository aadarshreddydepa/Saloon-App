from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User Model
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('customer', 'Customer'),
        ('owner', 'Salon Owner'),
        ('barber', 'Barber'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone = models.CharField(max_length=15, unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"


# Salon Model
class Salon(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='salons')
    name = models.CharField(max_length=200)
    description = models.TextField()
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    phone = models.CharField(max_length=15)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews = models.IntegerField(default=0)
    image = models.ImageField(upload_to='salons/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    cover_image = models.URLField(max_length=500, blank=True, null=True)
    gallery_images = models.JSONField(default=list, blank=True)  # List of image URLs
   
    
    def __str__(self):
        return self.name


# Service Model
class Service(models.Model):
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duration in minutes")
    is_active = models.BooleanField(default=True)
    image = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)      
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.salon.name}"


# Barber Model
class Barber(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='barber_profile')
    salon = models.ForeignKey(Salon, on_delete=models.SET_NULL, null=True, blank=True, related_name='barbers')
    specialization = models.CharField(max_length=200, blank=True)
    experience_years = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Ensure barber can only be assigned to one salon
        if self.salon:
            # Check if this barber is already assigned to another salon
            existing = Barber.objects.filter(user=self.user).exclude(pk=self.pk).first()
            if existing and existing.salon and existing.salon != self.salon:
                raise ValueError("Barber can only be assigned to one salon at a time")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.salon.name if self.salon else 'No Salon'}"


# Booking Model
class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='bookings')
    barber = models.ForeignKey(Barber, on_delete=models.SET_NULL, null=True, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    booking_date = models.DateField()
    booking_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    queue_position = models.IntegerField(null=True, blank=True)
    estimated_wait_time = models.IntegerField(null=True, blank=True, help_text="Wait time in minutes")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.id} - {self.customer.username} at {self.salon.name}"


# Payment Model
class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_METHOD = (
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
    )
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Payment for Booking #{self.booking.id} - {self.amount}"


# Review Model
class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='reviews')
    barber = models.ForeignKey(Barber, on_delete=models.CASCADE, related_name='reviews', null=True)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.customer.username} for {self.salon.name}"

class BarberJoinRequest(models.Model):
    """Model for barbers requesting to join salons"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    barber = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='join_requests',
        limit_choices_to={'user_type': 'barber'}
    )
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='join_requests')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['barber', 'salon']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.barber.username} -> {self.salon.name} ({self.status})"