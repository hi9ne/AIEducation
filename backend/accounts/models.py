from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    interests = models.JSONField(default=list, blank=True)
    goals = models.JSONField(default=list, blank=True)
    language_levels = models.JSONField(default=dict, blank=True)
    education_background = models.TextField(blank=True)
    work_experience = models.TextField(blank=True)
    preferred_countries = models.JSONField(default=list, blank=True)
    budget_range = models.CharField(max_length=50, blank=True)
    study_duration = models.CharField(max_length=50, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    # Дата экзамена/сертификата IELTS
    ielts_exam_date = models.DateField(null=True, blank=True)
    # Баллы и цели по экзаменам
    ielts_current_score = models.FloatField(null=True, blank=True)
    ielts_target_score = models.FloatField(null=True, blank=True)
    tolc_current_score = models.FloatField(null=True, blank=True)
    tolc_target_score = models.FloatField(null=True, blank=True)
    # Дата экзамена TOLC (если планируется/сдан)
    tolc_exam_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"


class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Verification for {self.user.email}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Password reset for {self.user.email}"
