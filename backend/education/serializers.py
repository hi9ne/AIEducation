from rest_framework import serializers
from .models import (
    University, Major, UniversityMajor, Course, Enrollment, Application,
    Achievement, UserAchievement, AIRecommendation, StudyPlan, StudyPlanItem,
    Document
)


class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = '__all__'


class UniversitySerializer(serializers.ModelSerializer):
    majors = MajorSerializer(many=True, read_only=True, source='majors.major')
    
    class Meta:
        model = University
        fields = '__all__'


class UniversityMajorSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    major = MajorSerializer(read_only=True)
    
    class Meta:
        model = UniversityMajor
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    major = MajorSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('user', 'enrolled_at')


class DashboardStatsSerializer(serializers.Serializer):
    # Provide sensible defaults and make fields non-required to avoid KeyError
    overall_progress = serializers.FloatField(required=False, default=0.0)
    ielts_completed = serializers.BooleanField(required=False, default=False)
    dov_completed = serializers.BooleanField(required=False, default=False)
    universities_selected = serializers.BooleanField(required=False, default=False)
    universitaly_registration = serializers.BooleanField(required=False, default=False)
    visa_obtained = serializers.BooleanField(required=False, default=False)
    total_courses = serializers.IntegerField(required=False, default=0)
    completed_courses = serializers.IntegerField(required=False, default=0)
    upcoming_deadlines = serializers.IntegerField(required=False, default=0)
    achievements_unlocked = serializers.IntegerField(required=False, default=0)
    current_streak = serializers.IntegerField(required=False, default=0)
    total_study_time = serializers.IntegerField(required=False, default=0)
    weekly_goal = serializers.IntegerField(required=False, default=0)
    weekly_progress = serializers.IntegerField(required=False, default=0)
    recommended_courses = CourseSerializer(many=True, required=False, default=list)
    total_points = serializers.IntegerField(required=False, default=0)
    applications_submitted = serializers.IntegerField(required=False, default=0)


class ApplicationSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    major = MajorSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('university', 'major', 'motivation_letter', 'documents')


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = '__all__'
        read_only_fields = ('user', 'earned_at')


class AIRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRecommendation
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class StudyPlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlanItem
        fields = '__all__'
        read_only_fields = ('study_plan',)


class StudyPlanSerializer(serializers.ModelSerializer):
    items = StudyPlanItemSerializer(many=True, read_only=True)
    target_university = UniversitySerializer(read_only=True)
    target_major = MajorSerializer(read_only=True)
    
    class Meta:
        model = StudyPlan
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('user', 'uploaded_at')
