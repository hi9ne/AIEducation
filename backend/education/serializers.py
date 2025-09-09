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
    # University has related_name 'majors' to UniversityMajor; expose list of Major
    majors = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = '__all__'

    def get_majors(self, obj):
        try:
            majors = [um.major for um in obj.majors.all()]
            return MajorSerializer(majors, many=True).data
        except Exception:
            return []

    def get_logo_url(self, obj):
        request = self.context.get('request')
        try:
            val = getattr(obj, 'logo', None)
            if not val:
                return ''
            # When DB stores an absolute URL in the field, return it as-is
            val_str = str(val)
            if val_str.startswith('http://') or val_str.startswith('https://'):
                return val_str
            # Otherwise resolve via storage URL (MEDIA_URL) and absolutize
            url = obj.logo.url
            return request.build_absolute_uri(url) if request and url else url
        except Exception:
            # Last-resort fallback: if string looks like URL, return it, else empty
            try:
                val = getattr(obj, 'logo', None)
                val_str = str(val) if val is not None else ''
                return val_str if (val_str.startswith('http://') or val_str.startswith('https://')) else ''
            except Exception:
                return ''


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
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('user', 'uploaded_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        try:
            url = obj.file.url if obj.file else ''
            return request.build_absolute_uri(url) if request and url else url
        except Exception:
            return ''
