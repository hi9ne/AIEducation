from django.contrib import admin
from .models import (
    PasswordResetCode, Payment, Subscription, UserEmailVerification,
    EmailVerificationToken, UserLoginLog, UserProfile
)
from .education_models import (
    StudentProfile, University, Major, UniversityMajor, StudentApplication,
    Document, StudentDocument, ProgressStep, AIRecommendation, Notification,
    Achievement, StudyPlan, StudyPlanItem
)


# Existing models
@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'created_at', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__username', 'user__email', 'code']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'amount', 'status', 'created_at']
    list_filter = ['status', 'plan', 'created_at']
    search_fields = ['user__username', 'pg_payment_id']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'is_active', 'expires_at', 'created_at']
    list_filter = ['plan', 'is_active', 'created_at']
    search_fields = ['user__username']


@admin.register(UserEmailVerification)
class UserEmailVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_verified', 'verified_at', 'attempts_count']
    list_filter = ['verified_at', 'created_at']
    search_fields = ['user__username']


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'used_at']
    list_filter = ['used_at', 'created_at']
    search_fields = ['user__username', 'token']


@admin.register(UserLoginLog)
class UserLoginLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'success', 'created_at']
    list_filter = ['success', 'created_at']
    search_fields = ['user__username', 'ip_address']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'language', 'created_at']
    list_filter = ['language', 'notifications_enabled', 'created_at']
    search_fields = ['user__username', 'phone']


# Education models
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'first_name', 'last_name', 'current_step', 'is_completed', 'created_at']
    list_filter = ['current_step', 'is_completed', 'education_level', 'created_at']
    search_fields = ['user__username', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'region', 'ranking_italy', 'is_active']
    list_filter = ['is_active', 'region', 'has_scholarships', 'created_at']
    search_fields = ['name', 'city', 'region']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Major)
class MajorAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'degree_type', 'duration_years']
    list_filter = ['category', 'degree_type']
    search_fields = ['name', 'category']


@admin.register(UniversityMajor)
class UniversityMajorAdmin(admin.ModelAdmin):
    list_display = ['university', 'major', 'is_available', 'seats_available']
    list_filter = ['is_available', 'major__category', 'major__degree_type']
    search_fields = ['university__name', 'major__name']


@admin.register(StudentApplication)
class StudentApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'university', 'major', 'status', 'application_date']
    list_filter = ['status', 'application_date', 'created_at']
    search_fields = ['student__user__username', 'university__name', 'major__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_required']
    list_filter = ['category', 'is_required']
    search_fields = ['name']


@admin.register(StudentDocument)
class StudentDocumentAdmin(admin.ModelAdmin):
    list_display = ['student', 'document', 'status', 'uploaded_at']
    list_filter = ['status', 'document__category', 'uploaded_at']
    search_fields = ['student__user__username', 'document__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProgressStep)
class ProgressStepAdmin(admin.ModelAdmin):
    list_display = ['student', 'step_name', 'status', 'started_at', 'completed_at']
    list_filter = ['status', 'step_name', 'created_at']
    search_fields = ['student__user__username', 'step_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ['student', 'recommendation_type', 'title', 'priority', 'is_read', 'created_at']
    list_filter = ['recommendation_type', 'priority', 'is_read', 'created_at']
    search_fields = ['student__user__username', 'title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'notification_type', 'is_read', 'is_important', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_important', 'created_at']
    search_fields = ['student__user__username', 'title']
    readonly_fields = ['created_at']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['student', 'achievement_type', 'title', 'points', 'unlocked_at']
    list_filter = ['achievement_type', 'unlocked_at']
    search_fields = ['student__user__username', 'title']
    readonly_fields = ['unlocked_at']


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['student__user__username', 'title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StudyPlanItem)
class StudyPlanItemAdmin(admin.ModelAdmin):
    list_display = ['study_plan', 'title', 'due_date', 'is_completed', 'order']
    list_filter = ['is_completed', 'due_date']
    search_fields = ['study_plan__title', 'title']
    readonly_fields = ['created_at', 'updated_at']
