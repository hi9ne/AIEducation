from django.db import models
from django.contrib.auth.models import User
import random
from django.utils import timezone
from datetime import timedelta
import uuid


class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_codes')
    code = models.CharField(max_length=6, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    is_used = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'code', 'is_used']),
            models.Index(fields=['created_at']),
        ]

    @staticmethod
    def generate_code():
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])

    def is_valid(self):
        return (
            not self.is_used and 
            self.created_at >= timezone.now() - timedelta(minutes=30)
        )

    def mark_as_used(self):
        self.is_used = True
        self.save(update_fields=['is_used'])

    def __str__(self):
        return f"Reset code for {self.user.username} - {self.code}"


class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    plan = models.CharField(max_length=32)
    amount = models.IntegerField()
    pg_payment_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='pending', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_method = models.CharField(max_length=32, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    failure_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['pg_payment_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self) -> str:
        return f"Payment(user={self.user.username}, plan={self.plan}, status={self.status})"


class Subscription(models.Model):
    PLAN_CHOICES = (
        ('basic', 'Basic Plan'),
        ('popular', 'Popular Plan'),
        ('premium', 'Premium Plan'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.CharField(max_length=32, choices=PLAN_CHOICES)
    is_active = models.BooleanField(default=False)
    starts_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    auto_renew = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['expires_at']),
        ]

    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    def days_left(self):
        if not self.expires_at or not self.is_active:
            return 0
        delta = self.expires_at - timezone.now()
        return max(0, delta.days)

    def extend_subscription(self, days):
        """Продлить подписку на указанное количество дней"""
        if self.expires_at and self.expires_at > timezone.now():
            self.expires_at += timedelta(days=days)
        else:
            self.expires_at = timezone.now() + timedelta(days=days)
        self.is_active = True
        self.save()

    def __str__(self) -> str:
        return f"Subscription(user={self.user.username}, plan={self.plan}, active={self.is_active})"


class UserEmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
    verified_at = models.DateTimeField(blank=True, null=True)
    last_sent_at = models.DateTimeField(blank=True, null=True)
    attempts_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_verified(self):
        return bool(self.verified_at)

    def can_send_email(self):
        """Проверяет, можно ли отправить письмо для верификации"""
        if not self.last_sent_at:
            return True
        
        # Ограничение: не чаще раза в минуту
        time_since_last = timezone.now() - self.last_sent_at
        return time_since_last >= timedelta(minutes=1)

    def increment_attempts(self):
        self.attempts_count += 1
        self.last_sent_at = timezone.now()
        self.save(update_fields=['attempts_count', 'last_sent_at'])

    def verify_email(self):
        self.verified_at = timezone.now()
        self.save(update_fields=['verified_at'])

    def __str__(self) -> str:
        return f"EmailVerification(user={self.user.username}, verified={self.is_verified()})"


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_tokens')
    token = models.CharField(max_length=128, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token', 'used_at']),
            models.Index(fields=['expires_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Токен действует 24 часа
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_valid(self):
        return (
            not self.used_at and 
            timezone.now() < self.expires_at
        )

    def mark_as_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=['used_at'])

    def __str__(self) -> str:
        return f"EmailToken(user={self.user.username}, used={bool(self.used_at)})"


class UserLoginLog(models.Model):
    """Модель для логирования входов пользователей"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_logs')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    success = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['ip_address']),
        ]

    def __str__(self):
        return f"Login {self.user.username} at {self.created_at}"


class UserProfile(models.Model):
    """Расширенная модель профиля пользователя"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.URLField(blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='ru')
    notifications_enabled = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

    def get_full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
