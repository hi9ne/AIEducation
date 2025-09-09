from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from datetime import datetime
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import secrets
import uuid

from .models import UserProfile, EmailVerification, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserProfileSerializer, PasswordChangeSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, EmailVerificationSerializer
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Создаем профиль пользователя
        UserProfile.objects.create(user=user)
        
        # Создаем токен для верификации email
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timezone.timedelta(hours=24)
        EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Отправляем email для верификации
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_mail(
            'Подтверждение регистрации',
            f'Перейдите по ссылке для подтверждения email: {verification_url}',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
        
        # Создаем JWT токены
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Пользователь успешно зарегистрирован. Проверьте email для подтверждения.',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Создаем JWT токены
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Успешный выход'})
    except Exception as e:
        return Response({'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    """
    Возвращает полные данные пользователя с профилем
    """
    try:
        # Получаем или создаем профиль пользователя
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Сериализуем пользователя с профилем
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': f'Ошибка при получении профиля: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Пароль успешно изменен'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            
            # Создаем токен для сброса пароля
            token = secrets.token_urlsafe(32)
            expires_at = timezone.now() + timezone.timedelta(hours=1)
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=expires_at
            )
            
            # Отправляем email для сброса пароля
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_mail(
                'Сброс пароля',
                f'Перейдите по ссылке для сброса пароля: {reset_url}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Инструкции по сбросу пароля отправлены на email'})
        except User.DoesNotExist:
            return Response({'message': 'Инструкции по сбросу пароля отправлены на email'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def confirm_password_reset(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
            if reset_token.is_expired():
                return Response({'error': 'Токен истек'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            reset_token.is_used = True
            reset_token.save()
            
            return Response({'message': 'Пароль успешно сброшен'})
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    serializer = EmailVerificationSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        
        try:
            verification = EmailVerification.objects.get(token=token, is_used=False)
            if verification.is_expired():
                return Response({'error': 'Токен истек'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = verification.user
            user.is_verified = True
            user.save()
            
            verification.is_used = True
            verification.save()
            
            return Response({'message': 'Email успешно подтвержден'})
        except EmailVerification.DoesNotExist:
            return Response({'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_email_verification(request):
    """
    Повторная отправка письма для подтверждения email текущего пользователя
    """
    user = request.user
    if user.is_verified:
        return Response({'message': 'Email уже подтвержден'}, status=status.HTTP_200_OK)

    # помечаем старые токены как использованные
    EmailVerification.objects.filter(user=user, is_used=False).update(is_used=True)

    # создаем новый токен и отправляем письмо
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timezone.timedelta(hours=24)
    EmailVerification.objects.create(user=user, token=token, expires_at=expires_at)

    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    send_mail(
        'Подтверждение email',
        f'Перейдите по ссылке для подтверждения email: {verification_url}',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )

    return Response({'message': 'Письмо для подтверждения отправлено'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token не предоставлен'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)
        
        return Response({
            'access': access_token,
            'refresh': str(token)
        })
    except Exception as e:
        return Response({'error': 'Неверный refresh token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_user_profile(request):
    """
    Обновляет профиль пользователя и связанные данные профиля
    """
    try:
        user = request.user
        data = request.data
        
        # Разделяем данные пользователя и профиля
        user_data = {}
        profile_data = {}
        
        # Поля пользователя
        user_fields = ['phone', 'date_of_birth', 'country', 'city', 'avatar']
        for field in user_fields:
            if field in data:
                user_data[field] = data[field]
        
        # Поля профиля
        profile_fields = [
            'bio', 'interests', 'goals', 'language_levels', 
            'education_background', 'work_experience', 
            'preferred_countries', 'budget_range', 'study_duration',
            'ielts_exam_date',
            # прямые поля для результатов экзаменов
            'ielts_current_score', 'ielts_target_score',
            'tolc_current_score', 'tolc_target_score', 'tolc_exam_date'
        ]
        for field in profile_fields:
            if field in data:
                profile_data[field] = data[field]

        # Дополнительно: поддержка вложенного объекта exams
        # Ожидаемый формат:
        # exams: { ielts: { score: '6.5', date: 'YYYY-MM' }, tolc: { score: '30', date: 'YYYY-MM' } }
        try:
            exams = data.get('exams')
            # exams could arrive as JSON string when using multipart/form-data
            if isinstance(exams, str):
                try:
                    import json
                    exams = json.loads(exams)
                except Exception:
                    exams = None
            if isinstance(exams, dict):
                ielts = exams.get('ielts') or {}
                tolc = exams.get('tolc') or {}

                # IELTS score
                score = ielts.get('score')
                if score not in (None, ''):
                    try:
                        profile_data['ielts_current_score'] = float(str(score).replace(',', '.'))
                    except Exception:
                        pass
                # IELTS target
                target = ielts.get('target')
                if target not in (None, ''):
                    try:
                        profile_data['ielts_target_score'] = float(str(target).replace(',', '.'))
                    except Exception:
                        pass
                # IELTS date (YYYY-MM or YYYY-MM-DD)
                date_val = ielts.get('date')
                if isinstance(date_val, str) and date_val:
                    try:
                        if len(date_val) == 7 and date_val[4] == '-':
                            # YYYY-MM -> first day of month
                            dt = datetime.strptime(date_val + '-01', '%Y-%m-%d').date()
                        else:
                            dt = datetime.strptime(date_val, '%Y-%m-%d').date()
                        profile_data['ielts_exam_date'] = dt.isoformat()
                    except Exception:
                        pass

                # TOLC score
                tscore = tolc.get('score')
                if tscore not in (None, ''):
                    try:
                        profile_data['tolc_current_score'] = float(str(tscore).replace(',', '.'))
                    except Exception:
                        pass
                # TOLC target
                ttarget = tolc.get('target')
                if ttarget not in (None, ''):
                    try:
                        profile_data['tolc_target_score'] = float(str(ttarget).replace(',', '.'))
                    except Exception:
                        pass
                # TOLC date
                tdate_val = tolc.get('date')
                if isinstance(tdate_val, str) and tdate_val:
                    try:
                        if len(tdate_val) == 7 and tdate_val[4] == '-':
                            tdt = datetime.strptime(tdate_val + '-01', '%Y-%m-%d').date()
                        else:
                            tdt = datetime.strptime(tdate_val, '%Y-%m-%d').date()
                        profile_data['tolc_exam_date'] = tdt.isoformat()
                    except Exception:
                        pass
        except Exception:
            pass
        
        # Обновляем пользователя
        if user_data:
            user_serializer = UserSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Обновляем профиль
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                # Если данные профиля включают ключевые поля, можно отметить онбординг завершенным
                updated_profile = profile_serializer.save()
                try:
                    required_ok = all([
                        bool(updated_profile.education_background),
                        bool(updated_profile.budget_range),
                        bool(updated_profile.study_duration),
                        isinstance(updated_profile.interests, list) and len(updated_profile.interests) > 0,
                        isinstance(updated_profile.goals, list) and len(updated_profile.goals) > 0,
                        isinstance(updated_profile.language_levels, dict) and len(updated_profile.language_levels) > 0,
                        bool(user.phone),
                        bool(user.city),
                    ])
                    if required_ok and not updated_profile.onboarding_completed:
                        updated_profile.onboarding_completed = True
                        updated_profile.save(update_fields=['onboarding_completed'])
                except Exception:
                    pass
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Возвращаем обновленные данные пользователя
        user_serializer = UserSerializer(user)
        return Response({
            'message': 'Профиль успешно обновлен',
            'user': user_serializer.data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Ошибка при обновлении профиля: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
