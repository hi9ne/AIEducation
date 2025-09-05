from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import education_views

# Создаем router для ViewSets (если понадобится)
router = DefaultRouter()

urlpatterns = [
    # Student Profile URLs
    path('profiles/', education_views.StudentProfileListCreateView.as_view(), name='student-profile-list'),
    path('profiles/<int:pk>/', education_views.StudentProfileDetailView.as_view(), name='student-profile-detail'),
    
    # University URLs
    path('universities/', education_views.UniversityListView.as_view(), name='university-list'),
    path('universities/<int:pk>/', education_views.UniversityDetailView.as_view(), name='university-detail'),
    path('universities/search/', education_views.search_universities, name='university-search'),
    
    # Major URLs
    path('majors/', education_views.MajorListView.as_view(), name='major-list'),
    
    # Student Application URLs
    path('applications/', education_views.StudentApplicationListCreateView.as_view(), name='application-list'),
    path('applications/<int:pk>/', education_views.StudentApplicationDetailView.as_view(), name='application-detail'),
    
    # Document URLs
    path('documents/', education_views.DocumentListView.as_view(), name='document-list'),
    path('student-documents/', education_views.StudentDocumentListCreateView.as_view(), name='student-document-list'),
    path('student-documents/<int:pk>/', education_views.StudentDocumentDetailView.as_view(), name='student-document-detail'),
    
    # Progress Step URLs
    path('progress-steps/', education_views.ProgressStepListView.as_view(), name='progress-step-list'),
    path('progress-steps/<str:step_name>/update/', education_views.update_progress_step, name='progress-step-update'),
    
    # AI Recommendation URLs
    path('ai-recommendations/', education_views.AIRecommendationListView.as_view(), name='ai-recommendation-list'),
    path('ai-recommendations/<int:pk>/', education_views.AIRecommendationDetailView.as_view(), name='ai-recommendation-detail'),
    path('ai-recommendations/generate/', education_views.generate_ai_recommendation, name='ai-recommendation-generate'),
    
    # Notification URLs
    path('notifications/', education_views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/read/', education_views.mark_notification_read, name='notification-read'),
    path('notifications/<int:pk>/', education_views.NotificationDetailView.as_view(), name='notification-detail'),
    
    # Achievement URLs
    path('achievements/', education_views.AchievementListView.as_view(), name='achievement-list'),
    
    # Study Plan URLs
    path('study-plans/', education_views.StudyPlanListCreateView.as_view(), name='study-plan-list'),
    path('study-plans/<int:pk>/', education_views.StudyPlanDetailView.as_view(), name='study-plan-detail'),
    
    # Dashboard URLs
    path('dashboard/stats/', education_views.dashboard_stats, name='dashboard-stats'),
]
