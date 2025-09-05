from rest_framework import serializers
from django.contrib.auth.models import User
from .education_models import (
    StudentProfile, University, Major, UniversityMajor, StudentApplication,
    Document, StudentDocument, ProgressStep, AIRecommendation, Notification,
    Achievement, StudyPlan, StudyPlanItem
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'first_name', 'last_name', 'birth_date', 'nationality',
            'phone', 'address', 'education_level', 'current_school', 'graduation_year',
            'ielts_score', 'ielts_date', 'toefl_score', 'toefl_date', 'italian_level',
            'preferred_majors', 'preferred_cities', 'budget_min', 'budget_max',
            'current_step', 'progress_percentage', 'is_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress_percentage']


class StudentProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'first_name', 'last_name', 'birth_date', 'nationality', 'phone', 'address',
            'education_level', 'current_school', 'graduation_year', 'ielts_score',
            'ielts_date', 'toefl_score', 'toefl_date', 'italian_level',
            'preferred_majors', 'preferred_cities', 'budget_min', 'budget_max'
        ]


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            'id', 'name', 'name_italian', 'city', 'region', 'website', 'logo',
            'ranking_italy', 'ranking_world', 'founded_year', 'student_count',
            'ielts_min', 'toefl_min', 'italian_level_min', 'tuition_fee_eu',
            'tuition_fee_non_eu', 'living_cost_monthly', 'has_scholarships',
            'scholarship_info', 'application_deadline', 'scholarship_deadline',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = [
            'id', 'name', 'name_italian', 'description', 'category',
            'duration_years', 'degree_type'
        ]
        read_only_fields = ['id']


class UniversityMajorSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    major = MajorSerializer(read_only=True)
    
    class Meta:
        model = UniversityMajor
        fields = ['id', 'university', 'major', 'is_available', 'seats_available']
        read_only_fields = ['id']


class StudentApplicationSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    major = MajorSerializer(read_only=True)
    
    class Meta:
        model = StudentApplication
        fields = [
            'id', 'university', 'major', 'status', 'application_date',
            'response_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentApplication
        fields = ['university', 'major', 'status', 'notes']


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'name', 'description', 'is_required', 'category']
        read_only_fields = ['id']


class StudentDocumentSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = StudentDocument
        fields = [
            'id', 'document', 'status', 'file_url', 'file_name', 'file_size',
            'uploaded_at', 'verified_at', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentDocumentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentDocument
        fields = ['status', 'file_url', 'file_name', 'file_size', 'notes']


class ProgressStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressStep
        fields = [
            'id', 'step_name', 'step_description', 'status', 'started_at',
            'completed_at', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'recommendation_type', 'title', 'content', 'priority',
            'is_read', 'is_applied', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read',
            'is_important', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'achievement_type', 'title', 'description', 'points',
            'icon', 'unlocked_at'
        ]
        read_only_fields = ['id', 'unlocked_at']


class StudyPlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlanItem
        fields = [
            'id', 'title', 'description', 'due_date', 'is_completed',
            'completed_at', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudyPlanSerializer(serializers.ModelSerializer):
    items = StudyPlanItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudyPlan
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date',
            'is_active', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DashboardStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики дашборда"""
    total_students = serializers.IntegerField()
    active_applications = serializers.IntegerField()
    completed_profiles = serializers.IntegerField()
    universities_count = serializers.IntegerField()
    recent_achievements = AchievementSerializer(many=True)
    upcoming_deadlines = serializers.ListField(child=serializers.DictField())
    progress_overview = serializers.DictField()


class UniversitySearchSerializer(serializers.Serializer):
    """Сериализатор для поиска университетов"""
    query = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    region = serializers.CharField(required=False)
    major = serializers.CharField(required=False)
    min_ielts = serializers.FloatField(required=False)
    max_tuition = serializers.IntegerField(required=False)
    has_scholarships = serializers.BooleanField(required=False)
    page = serializers.IntegerField(default=1)
    page_size = serializers.IntegerField(default=20)


class AIRecommendationRequestSerializer(serializers.Serializer):
    """Сериализатор для запроса AI рекомендаций"""
    student_id = serializers.IntegerField()
    recommendation_type = serializers.ChoiceField(choices=[
        ('university', 'Рекомендация университета'),
        ('major', 'Рекомендация направления'),
        ('document', 'Рекомендация по документам'),
        ('timeline', 'Рекомендация по срокам'),
        ('general', 'Общая рекомендация'),
    ])
    context = serializers.CharField(required=False)
