"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from hack.views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    PasswordResetRequestView, PasswordResetVerifyView, PaymentView,
    PaymentStatusView, PaymentWebhookView, PaymentSimulateView,
    ProfileUpdateView, ChangePasswordView, EmailVerifyRequestView, EmailVerifyView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('api/password-reset/verify/', PasswordResetVerifyView.as_view(), name='password-reset-verify'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('api/profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/email/verify/request/', EmailVerifyRequestView.as_view(), name='email-verify-request'),
    path('api/email/verify/', EmailVerifyView.as_view(), name='email-verify'),
    path('api/pay/', PaymentView.as_view(), name='pay'),
    path('api/pay/status/', PaymentStatusView.as_view(), name='pay-status'),
    path('api/pay/webhook/', PaymentWebhookView.as_view(), name='pay-webhook'),
    path('api/pay/simulate/', PaymentSimulateView.as_view(), name='pay-simulate'),
]
