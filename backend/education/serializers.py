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


class DashboardStatsSerializer(serializers.Serializer):
    total_courses = serializers.IntegerField()
    completed_courses = serializers.IntegerField()
    upcoming_deadlines = serializers.IntegerField()
    achievements_unlocked = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    total_points = serializers.IntegerField()
    applications_submitted = serializers.IntegerField()
    universities_favorited = serializers.IntegerField()
