from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta

from .models import (
    University, Major, Course, Enrollment, Application, Achievement,
    UserAchievement, AIRecommendation, StudyPlan, StudyPlanItem, Document
)
from .serializers import (
    UniversitySerializer, MajorSerializer, CourseSerializer, EnrollmentSerializer,
    ApplicationSerializer, ApplicationCreateSerializer, AchievementSerializer,
    UserAchievementSerializer, AIRecommendationSerializer, StudyPlanSerializer,
    StudyPlanItemSerializer, DocumentSerializer, DashboardStatsSerializer
)


class UniversityListView(generics.ListAPIView):
    queryset = University.objects.filter(is_active=True)
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['country', 'city']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'ranking', 'tuition_fee']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по специальности
        major = self.request.query_params.get('major')
        if major:
            queryset = queryset.filter(majors__major__name__icontains=major)
        
        # Фильтрация по стоимости
        min_tuition = self.request.query_params.get('min_tuition')
        max_tuition = self.request.query_params.get('max_tuition')
        
        if min_tuition:
            queryset = queryset.filter(tuition_fee__gte=min_tuition)
        if max_tuition:
            queryset = queryset.filter(tuition_fee__lte=max_tuition)
        
        return queryset


class UniversityDetailView(generics.RetrieveAPIView):
    queryset = University.objects.filter(is_active=True)
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticated]


class MajorListView(generics.ListAPIView):
    queryset = Major.objects.filter(is_active=True)
    serializer_class = MajorSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['university', 'major', 'difficulty_level', 'is_free']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'price', 'created_at']
    ordering = ['-created_at']


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentListView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)


class ApplicationListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)


class AchievementListView(generics.ListAPIView):
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserAchievementListView(generics.ListAPIView):
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user)


class AIRecommendationListView(generics.ListAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user).order_by('-created_at')


class AIRecommendationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user)


class StudyPlanListView(generics.ListCreateAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StudyPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)


class DocumentListView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # Статистика курсов
    total_courses = Course.objects.filter(is_active=True).count()
    completed_courses = Enrollment.objects.filter(
        user=user, is_completed=True
    ).count()
    
    # Предстоящие дедлайны (из планов обучения)
    upcoming_deadlines = StudyPlanItem.objects.filter(
        study_plan__user=user,
        is_completed=False,
        due_date__gte=timezone.now().date()
    ).count()
    
    # Достижения
    achievements_unlocked = UserAchievement.objects.filter(user=user).count()
    
    # Текущая серия (дни подряд)
    current_streak = 7  # Моковое значение
    
    # Общие очки
    total_points = UserAchievement.objects.filter(user=user).aggregate(
        total=Sum('achievement__points')
    )['total'] or 0
    
    # Заявки
    applications_submitted = Application.objects.filter(user=user).count()
    
    # Избранные университеты (моковое значение)
    universities_favorited = 3
    
    stats = {
        'total_courses': total_courses,
        'completed_courses': completed_courses,
        'upcoming_deadlines': upcoming_deadlines,
        'achievements_unlocked': achievements_unlocked,
        'current_streak': current_streak,
        'total_points': total_points,
        'applications_submitted': applications_submitted,
        'universities_favorited': universities_favorited,
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_ai_recommendations(request):
    user = request.user
    
    # Генерируем рекомендации на основе профиля пользователя
    recommendations = [
        {
            'title': 'Рекомендуемые университеты',
            'content': 'На основе ваших интересов рекомендуем рассмотреть университеты в Италии.',
            'category': 'university',
            'priority': 1
        },
        {
            'title': 'Подготовка к IELTS',
            'content': 'Начните подготовку к IELTS за 6 месяцев до подачи заявки.',
            'category': 'preparation',
            'priority': 2
        },
        {
            'title': 'Сбор документов',
            'content': 'Подготовьте все необходимые документы заранее.',
            'category': 'documents',
            'priority': 3
        }
    ]
    
    for rec_data in recommendations:
        AIRecommendation.objects.create(
            user=user,
            title=rec_data['title'],
            content=rec_data['content'],
            category=rec_data['category'],
            priority=rec_data['priority']
        )
    
    return Response({'message': 'Рекомендации сгенерированы'})
