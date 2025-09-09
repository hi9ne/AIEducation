from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('token/refresh/', views.refresh_token, name='refresh_token'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/update-complete/', views.update_user_profile, name='update_user_profile'),
    path('user-profile/', views.user_profile, name='user_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('confirm-password-reset/', views.confirm_password_reset, name='confirm_password_reset'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('email/verify/request/', views.request_email_verification, name='request_email_verification'),
]
