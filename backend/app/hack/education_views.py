from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta, date
import openai
import os
from django.conf import settings

from .education_models import (
    StudentProfile, University, Major, UniversityMajor, StudentApplication,
    Document, StudentDocument, ProgressStep, AIRecommendation, Notification,
    Achievement, StudyPlan, StudyPlanItem
)
from .education_serializers import (
    StudentProfileSerializer, StudentProfileCreateSerializer,
    UniversitySerializer, MajorSerializer, UniversityMajorSerializer,
    StudentApplicationSerializer, StudentApplicationCreateSerializer,
    DocumentSerializer, StudentDocumentSerializer, StudentDocumentUpdateSerializer,
    ProgressStepSerializer, AIRecommendationSerializer, NotificationSerializer,
    AchievementSerializer, StudyPlanSerializer, StudyPlanItemSerializer,
    DashboardStatsSerializer, UniversitySearchSerializer, AIRecommendationRequestSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# Student Profile Views
class StudentProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return StudentProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StudentProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StudentProfile.objects.filter(user=self.request.user)


# University Views
class UniversityListView(generics.ListAPIView):
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = University.objects.filter(is_active=True)
        
        # Фильтрация по параметрам поиска
        city = self.request.query_params.get('city')
        region = self.request.query_params.get('region')
        major = self.request.query_params.get('major')
        min_ielts = self.request.query_params.get('min_ielts')
        max_tuition = self.request.query_params.get('max_tuition')
        has_scholarships = self.request.query_params.get('has_scholarships')
        
        if city:
            queryset = queryset.filter(city__icontains=city)
        if region:
            queryset = queryset.filter(region__icontains=region)
        if major:
            queryset = queryset.filter(majors__major__name__icontains=major)
        if min_ielts:
            queryset = queryset.filter(ielts_min__lte=float(min_ielts))
        if max_tuition:
            queryset = queryset.filter(tuition_fee_non_eu__lte=int(max_tuition))
        if has_scholarships:
            queryset = queryset.filter(has_scholarships=True)
        
        return queryset.distinct()


class UniversityDetailView(generics.RetrieveAPIView):
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = University.objects.filter(is_active=True)


# Major Views
class MajorListView(generics.ListAPIView):
    serializer_class = MajorSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Major.objects.all()
        category = self.request.query_params.get('category')
        degree_type = self.request.query_params.get('degree_type')
        
        if category:
            queryset = queryset.filter(category__icontains=category)
        if degree_type:
            queryset = queryset.filter(degree_type=degree_type)
        
        return queryset


# Student Application Views
class StudentApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return StudentApplication.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return StudentApplication.objects.none()
    
    def perform_create(self, serializer):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            serializer.save(student=student_profile)
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError("Student profile not found")


class StudentApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return StudentApplication.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return StudentApplication.objects.none()


# Document Views
class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Document.objects.all()


class StudentDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return StudentDocument.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return StudentDocument.objects.none()
    
    def perform_create(self, serializer):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            serializer.save(student=student_profile)
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError("Student profile not found")


class StudentDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return StudentDocument.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return StudentDocument.objects.none()


# Progress Step Views
class ProgressStepListView(generics.ListAPIView):
    serializer_class = ProgressStepSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return ProgressStep.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return ProgressStep.objects.none()


# AI Recommendation Views
class AIRecommendationListView(generics.ListAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return AIRecommendation.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return AIRecommendation.objects.none()


class AIRecommendationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return AIRecommendation.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return AIRecommendation.objects.none()


# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return Notification.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return Notification.objects.none()


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return Notification.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return Notification.objects.none()


# Achievement Views
class AchievementListView(generics.ListAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return Achievement.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return Achievement.objects.none()


# Study Plan Views
class StudyPlanListCreateView(generics.ListCreateAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return StudyPlan.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return StudyPlan.objects.none()
    
    def perform_create(self, serializer):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            serializer.save(student=student_profile)
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError("Student profile not found")


class StudyPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            student_profile = StudentProfile.objects.get(user=self.request.user)
            return StudyPlan.objects.filter(student=student_profile)
        except StudentProfile.DoesNotExist:
            return StudyPlan.objects.none()


# Custom API Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Получение статистики для дашборда"""
    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        
        # Статистика
        total_students = StudentProfile.objects.count()
        active_applications = StudentApplication.objects.filter(
            student=student_profile,
            status__in=['submitted', 'under_review']
        ).count()
        completed_profiles = StudentProfile.objects.filter(is_completed=True).count()
        universities_count = University.objects.filter(is_active=True).count()
        
        # Последние достижения
        recent_achievements = Achievement.objects.filter(
            student=student_profile
        ).order_by('-unlocked_at')[:5]
        
        # Предстоящие дедлайны
        upcoming_deadlines = []
        applications = StudentApplication.objects.filter(
            student=student_profile,
            status__in=['submitted', 'under_review']
        )
        
        for app in applications:
            if app.university.application_deadline:
                days_left = (app.university.application_deadline - date.today()).days
                if days_left >= 0:
                    upcoming_deadlines.append({
                        'title': f"Дедлайн подачи в {app.university.name}",
                        'date': app.university.application_deadline,
                        'days_left': days_left,
                        'priority': 'high' if days_left <= 7 else 'medium'
                    })
        
        # Обзор прогресса
        progress_overview = {
            'current_step': student_profile.current_step,
            'progress_percentage': student_profile.get_progress_percentage(),
            'completed_steps': ProgressStep.objects.filter(
                student=student_profile,
                status='completed'
            ).count(),
            'total_steps': ProgressStep.objects.filter(student=student_profile).count()
        }
        
        data = {
            'total_students': total_students,
            'active_applications': active_applications,
            'completed_profiles': completed_profiles,
            'universities_count': universities_count,
            'recent_achievements': recent_achievements,
            'upcoming_deadlines': upcoming_deadlines,
            'progress_overview': progress_overview
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_ai_recommendation(request):
    """Генерация AI рекомендаций"""
    serializer = AIRecommendationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        student_profile = StudentProfile.objects.get(
            id=serializer.validated_data['student_id'],
            user=request.user
        )
        
        # Здесь можно интегрировать с OpenAI API
        # Пока возвращаем заглушку
        recommendation = AIRecommendation.objects.create(
            student=student_profile,
            recommendation_type=serializer.validated_data['recommendation_type'],
            title="AI Рекомендация",
            content="Это пример AI рекомендации. В реальном приложении здесь будет интеграция с OpenAI.",
            priority='medium'
        )
        
        return Response(AIRecommendationSerializer(recommendation).data)
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_universities(request):
    """Поиск университетов с фильтрами"""
    serializer = UniversitySearchSerializer(data=request.query_params)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    queryset = University.objects.filter(is_active=True)
    
    # Применяем фильтры
    if serializer.validated_data.get('query'):
        queryset = queryset.filter(
            Q(name__icontains=serializer.validated_data['query']) |
            Q(name_italian__icontains=serializer.validated_data['query']) |
            Q(city__icontains=serializer.validated_data['query'])
        )
    
    if serializer.validated_data.get('city'):
        queryset = queryset.filter(city__icontains=serializer.validated_data['city'])
    
    if serializer.validated_data.get('region'):
        queryset = queryset.filter(region__icontains=serializer.validated_data['region'])
    
    if serializer.validated_data.get('major'):
        queryset = queryset.filter(majors__major__name__icontains=serializer.validated_data['major'])
    
    if serializer.validated_data.get('min_ielts'):
        queryset = queryset.filter(ielts_min__lte=serializer.validated_data['min_ielts'])
    
    if serializer.validated_data.get('max_tuition'):
        queryset = queryset.filter(tuition_fee_non_eu__lte=serializer.validated_data['max_tuition'])
    
    if serializer.validated_data.get('has_scholarships'):
        queryset = queryset.filter(has_scholarships=True)
    
    # Пагинация
    page = serializer.validated_data.get('page', 1)
    page_size = serializer.validated_data.get('page_size', 20)
    
    start = (page - 1) * page_size
    end = start + page_size
    
    universities = queryset.distinct()[start:end]
    total = queryset.distinct().count()
    
    return Response({
        'results': UniversitySerializer(universities, many=True).data,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_progress_step(request, step_name):
    """Обновление шага прогресса"""
    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        
        step, created = ProgressStep.objects.get_or_create(
            student=student_profile,
            step_name=step_name,
            defaults={
                'step_description': f"Шаг: {step_name}",
                'status': 'in_progress',
                'started_at': timezone.now()
            }
        )
        
        if not created:
            step.status = 'completed'
            step.completed_at = timezone.now()
            step.save()
        
        return Response(ProgressStepSerializer(step).data)
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Отметить уведомление как прочитанное"""
    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        notification = Notification.objects.get(
            id=notification_id,
            student=student_profile
        )
        
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({'status': 'success'})
        
    except (StudentProfile.DoesNotExist, Notification.DoesNotExist):
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
