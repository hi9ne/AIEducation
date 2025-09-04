from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from django.utils.crypto import get_random_string
from django.urls import reverse
from datetime import timedelta
import logging
import uuid
import os
import hashlib

from .models import (
    PasswordResetCode, Payment, Subscription, 
    UserEmailVerification, EmailVerificationToken,
    UserLoginLog, UserProfile
)
from .serializers import (
    RegisterSerializer, MyTokenObtainPairSerializer, 
    PasswordResetRequestSerializer, PasswordResetVerifySerializer,
    ProfileUpdateSerializer, ChangePasswordSerializer,
    ProfileSerializer, EmailVerificationSerializer
)
from .freedompay import process_freedompay_payment

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Получить IP адрес клиента"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Получить User-Agent клиента"""
    return request.META.get('HTTP_USER_AGENT', '')


class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Логируем успешный вход
            try:
                username = request.data.get('username')
                if '@' in username:
                    user = User.objects.get(email=username.lower())
                else:
                    user = User.objects.get(username=username)
                
                UserLoginLog.objects.create(
                    user=user,
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request),
                    success=True
                )
                
                # Обновляем last_login
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
                
            except Exception as e:
                logger.error(f"Error logging successful login: {e}")
        else:
            # Логируем неудачную попытку входа
            try:
                username = request.data.get('username')
                UserLoginLog.objects.create(
                    user=None,
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request),
                    success=False
                )
            except Exception as e:
                logger.error(f"Error logging failed login: {e}")
        
        return response


class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            user = serializer.save()
            
            # Создаем профиль пользователя
            UserProfile.objects.get_or_create(user=user)
            
            # Отправляем приветственное письмо
            try:
                self.send_welcome_email(user)
            except Exception as e:
                logger.error(f"Failed to send welcome email to {user.email}: {e}")
        
        return Response({
            'message': 'Регистрация прошла успешно! Проверьте email для подтверждения.',
            'user_id': user.id,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_201_CREATED)

    def send_welcome_email(self, user):
        """Отправка приветственного письма"""
        context = {
            'username': user.username,
            'year': timezone.now().year,
            'site_name': 'AIEducation'
        }
        
        html_message = render_to_string('emails/welcome.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Добро пожаловать в AIEducation!',
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )


class PasswordResetRequestView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Проверяем лимит отправки кодов (не более 3 за час)
        hour_ago = timezone.now() - timedelta(hours=1)
        recent_codes = PasswordResetCode.objects.filter(
            user=user,
            created_at__gte=hour_ago
        ).count()
        
        if recent_codes >= 3:
            return Response(
                {"error": "Слишком много попыток. Попробуйте через час."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Генерируем и сохраняем код
        code = PasswordResetCode.generate_code()
        PasswordResetCode.objects.create(
            user=user,
            code=code,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request)
        )
        
        # Отправляем email
        try:
            context = {
                'code': code,
                'username': user.username,
                'year': timezone.now().year,
                'valid_minutes': 30
            }
            
            html_message = render_to_string('emails/password_reset.html', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject='Код для сброса пароля - AIEducation',
                message=plain_message,
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            logger.info(f"Password reset code sent to {email}")
            
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            return Response(
                {"error": "Ошибка отправки email. Попробуйте позже."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "message": "Код для сброса пароля отправлен на ваш email",
            "expires_in_minutes": 30
        }, status=status.HTTP_200_OK)


class PasswordResetVerifyView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetVerifySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Проверяем код
        reset_code = PasswordResetCode.objects.filter(
            user=user,
            code=code,
            is_used=False,
            created_at__gte=timezone.now() - timedelta(minutes=30)
        ).first()
        
        if not reset_code:
            return Response(
                {"error": "Неверный или истекший код"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверяем количество попыток (защита от брутфорса)
        recent_attempts = PasswordResetCode.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timedelta(hours=1)
        ).count()
        
        if recent_attempts > 5:
            return Response(
                {"error": "Слишком много попыток. Попробуйте через час."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Сбрасываем пароль
        with transaction.atomic():
            user.set_password(new_password)
            user.save()
            
            reset_code.mark_as_used()
            
            # Помечаем все остальные коды как использованные
            PasswordResetCode.objects.filter(
                user=user,
                is_used=False
            ).update(is_used=True)
        
        logger.info(f"Password reset successful for user {user.username}")
        
        return Response({
            "message": "Пароль успешно изменен"
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Можно добавить логику для blacklist токенов
        logger.info(f"User {request.user.username} logged out")
        return Response({
            'message': 'Успешный выход из системы'
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)


class ProfileUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        
        if response.status_code == 200:
            logger.info(f"Profile updated for user {request.user.username}")
            
            # Если изменился email, отправляем уведомление
            if 'email' in request.data:
                try:
                    self.send_email_change_notification(request.user)
                except Exception as e:
                    logger.error(f"Failed to send email change notification: {e}")
        
        return response

    def send_email_change_notification(self, user):
        """Уведомление об изменении email"""
        context = {
            'username': user.username,
            'new_email': user.email,
            'year': timezone.now().year
        }
        
        html_message = render_to_string('emails/email_changed.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Email адрес изменен - AIEducation',
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )


class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        logger.info(f"Password changed for user {request.user.username}")
        
        # Отправляем уведомление об изменении пароля
        try:
            self.send_password_change_notification(request.user)
        except Exception as e:
            logger.error(f"Failed to send password change notification: {e}")
        
        return Response({
            'message': 'Пароль успешно изменен',
            'timestamp': timezone.now().isoformat()
        })

    def send_password_change_notification(self, user):
        """Уведомление об изменении пароля"""
        context = {
            'username': user.username,
            'timestamp': timezone.now().strftime('%d.%m.%Y %H:%M'),
            'year': timezone.now().year
        }
        
        html_message = render_to_string('emails/password_changed.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Пароль изменен - AIEducation',
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )


class EmailVerifyRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = EmailVerificationSerializer(data={}, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Получаем или создаем запись верификации
        email_verification, _ = UserEmailVerification.objects.get_or_create(user=user)
        
        # Проверяем, не верифицирован ли уже email
        if email_verification.is_verified():
            return Response({
                'message': 'Email уже подтвержден'
            }, status=status.HTTP_200_OK)
        
        # Проверяем лимиты
        if not email_verification.can_send_email():
            return Response({
                'error': 'Письмо можно отправить не чаще чем раз в минуту'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Генерируем токен
        token = get_random_string(48)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            ip_address=get_client_ip(request)
        )
        
        # Формируем ссылку для верификации
        verify_link = request.build_absolute_uri(
            reverse('email-verify') + f'?token={token}'
        )
        
        # Отправляем письмо
        try:
            context = {
                'username': user.username,
                'verify_link': verify_link,
                'year': timezone.now().year,
                'site_name': 'AIEducation'
            }
            
            html_message = render_to_string('emails/email_verify.html', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject='Подтверждение email - AIEducation',
                message=plain_message,
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            # Обновляем статистику
            email_verification.increment_attempts()
            
            logger.info(f"Email verification sent to {user.email}")
            
        except Exception as e:
            logger.error(f"Failed to send email verification: {e}")
            return Response({
                'error': 'Ошибка отправки письма. Попробуйте позже.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Письмо для подтверждения отправлено на ваш email',
            'expires_in_hours': 24
        })


class EmailVerifyView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        token = request.query_params.get('token')
        
        if not token:
            return Response({
                'error': 'Токен не указан'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем токен
        email_token = EmailVerificationToken.objects.filter(
            token=token,
            used_at__isnull=True,
            expires_at__gt=timezone.now()
        ).first()
        
        if not email_token:
            return Response({
                'error': 'Неверный или истекший токен'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Подтверждаем email
        with transaction.atomic():
            email_verification, _ = UserEmailVerification.objects.get_or_create(
                user=email_token.user
            )
            email_verification.verify_email()
            email_token.mark_as_used()
        
        logger.info(f"Email verified for user {email_token.user.username}")
        
        # Отправляем уведомление об успешной верификации
        try:
            self.send_verification_success_email(email_token.user)
        except Exception as e:
            logger.error(f"Failed to send verification success email: {e}")
        
        return Response({
            'message': 'Email успешно подтвержден!',
            'user': email_token.user.username
        })

    def send_verification_success_email(self, user):
        """Отправка уведомления об успешной верификации"""
        context = {
            'username': user.username,
            'year': timezone.now().year
        }
        
        html_message = render_to_string('emails/verification_success.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Email подтвержден - AIEducation',
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )


# Платежные views (сохраняем существующие)
class PaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get('plan')
        card_number = request.data.get('card_number')
        card_expiry = request.data.get('card_expiry')
        card_cvv = request.data.get('card_cvv')
        card_holder = request.data.get('card_holder')
        user = request.user
        try:
            amount = self._get_plan_amount(plan)
            client_ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0] or request.META.get('REMOTE_ADDR')
            payment_result = process_freedompay_payment(
                amount=amount,
                card_number=card_number,
                card_expiry=card_expiry,
                card_cvv=card_cvv,
                card_holder=card_holder,
                user=user,
                plan=plan,
                client_ip=client_ip,
            )
            if payment_result.get('success'):
                # Парсим pg_payment_id и pg_redirect_url из raw XML
                raw = payment_result.get('raw') or ''
                pg_payment_id = None
                pg_redirect_url = None
                if '<pg_payment_id>' in raw:
                    try:
                        start = raw.index('<pg_payment_id>') + len('<pg_payment_id>')
                        end = raw.index('</pg_payment_id>')
                        pg_payment_id = raw[start:end]
                    except Exception:
                        pg_payment_id = None
                if '<pg_redirect_url>' in raw:
                    try:
                        start = raw.index('<pg_redirect_url>') + len('<pg_redirect_url>')
                        end = raw.index('</pg_redirect_url>')
                        pg_redirect_url = raw[start:end]
                        # XML экранирует &amp; → &
                        pg_redirect_url = pg_redirect_url.replace('&amp;', '&')
                    except Exception:
                        pg_redirect_url = None
                with transaction.atomic():
                    pay = Payment.objects.create(
                        user=user,
                        plan=plan,
                        amount=amount,
                        pg_payment_id=pg_payment_id,
                        status='pending',
                    )
                return Response({
                    'status': 'redirect',
                    'payment_id': pg_payment_id,
                    'payment_url': pg_redirect_url,
                }, status=status.HTTP_200_OK)
            return Response({'status': 'fail', 'message': payment_result.get('error', 'Ошибка оплаты'), 'details': payment_result}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logging.exception('Ошибка при обработке платежа FreedomPay')
            return Response({'status': 'fail', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_plan_amount(self, plan):
        plans = {
            'basic': 10,
            'popular': 15,
            'premium': 40,
        }
        return plans.get(plan, 10)


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pg_payment_id = request.query_params.get('payment_id')
        if not pg_payment_id:
            return Response({'error': 'payment_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        payment = Payment.objects.filter(pg_payment_id=pg_payment_id, user=request.user).first()
        if not payment:
            return Response({'error': 'payment not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'status': payment.status})


class PaymentWebhookView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        # FreedomPay (PayBox) шлёт pg_* в form-data
        data = request.data.copy()
        pg_sig = data.get('pg_sig')
        if not pg_sig:
            return Response({'error': 'pg_sig missing'}, status=status.HTTP_400_BAD_REQUEST)
        script_name = data.get('pg_script', 'result.php')
        # Собираем строку для подписи: script;sorted_values_without_pg_sig;secret
        params = {k: v for k, v in data.items() if k != 'pg_sig'}
        keys = sorted(params.keys())
        values = [str(params[k]) for k in keys]
        sign_str = ';'.join([script_name] + values + [os.getenv('FREEDOMPAY_SECRET_KEY', '')])
        expected_sig = hashlib.md5(sign_str.encode('utf-8')).hexdigest()
        if expected_sig != pg_sig:
            return Response({'error': 'invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
        pg_payment_id = data.get('pg_payment_id')
        pg_result = (data.get('pg_result') or data.get('pg_status') or '').lower()
        pay = Payment.objects.filter(pg_payment_id=pg_payment_id).first()
        if not pay:
            return Response({'error': 'payment not found'}, status=status.HTTP_404_NOT_FOUND)
        if pg_result in ('1', 'ok', 'success'):
            with transaction.atomic():
                pay.status = 'paid'
                pay.save(update_fields=['status', 'updated_at'])
                sub, _ = Subscription.objects.get_or_create(user=pay.user, defaults={'plan': pay.plan})
                sub.plan = pay.plan
                sub.is_active = True
                sub.starts_at = timezone.now()
                # На 30 дней для примера
                sub.expires_at = timezone.now() + timedelta(days=30)
                sub.save()
            # Отправляем чек (только подтвержденная почта)
            try:
                if getattr(pay.user, 'email_verification', None) and pay.user.email_verification.verified_at:
                    context = {
                        'username': pay.user.username,
                        'payment_id': pay.pg_payment_id or '—',
                        'paid_at': timezone.now().strftime('%d.%m.%Y %H:%M'),
                        'plan': pay.plan,
                        'starts_at': sub.starts_at.strftime('%d.%m.%Y') if sub.starts_at else '—',
                        'expires_at': sub.expires_at.strftime('%d.%m.%Y') if sub.expires_at else '—',
                        'amount': pay.amount,
                        'currency': 'USD',
                        'year': timezone.now().year,
                    }
                    html = render_to_string('emails/payment_receipt.html', context)
                    send_mail(
                        subject='Чек об оплате — AIEducation',
                        message='Оплата прошла успешно',
                        html_message=html,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[pay.user.email],
                        fail_silently=True,
                    )
            except Exception:
                logging.exception('Не удалось отправить чек по email')
        elif pg_result in ('0', 'failed', 'error'):
            pay.status = 'failed'
            pay.save(update_fields=['status', 'updated_at'])
        # Ответ согласно протоколу PayBox
        return Response({'pg_status': 'ok'})


class PaymentSimulateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Разрешаем только в DEBUG-окружении
        from django.conf import settings
        if not settings.DEBUG:
            return Response({'error': 'simulation disabled'}, status=status.HTTP_403_FORBIDDEN)
        pg_payment_id = request.data.get('payment_id')
        if not pg_payment_id:
            return Response({'error': 'payment_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        pay = Payment.objects.filter(pg_payment_id=pg_payment_id).first()
        if not pay:
            return Response({'error': 'payment not found'}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            pay.status = 'paid'
            pay.save(update_fields=['status', 'updated_at'])
            sub, _ = Subscription.objects.get_or_create(user=pay.user, defaults={'plan': pay.plan})
            sub.plan = pay.plan
            sub.is_active = True
            sub.starts_at = timezone.now()
            sub.expires_at = timezone.now() + timedelta(days=30)
            sub.save()
        # Отправка чека (только подтвержденная почта)
        try:
            if getattr(pay.user, 'email_verification', None) and pay.user.email_verification.verified_at:
                context = {
                    'username': pay.user.username,
                    'payment_id': pay.pg_payment_id or '—',
                    'paid_at': timezone.now().strftime('%d.%m.%Y %H:%M'),
                    'plan': pay.plan,
                    'starts_at': sub.starts_at.strftime('%d.%m.%Y') if sub.starts_at else '—',
                    'expires_at': sub.expires_at.strftime('%d.%m.%Y') if sub.expires_at else '—',
                    'amount': pay.amount,
                    'currency': 'USD',
                    'year': timezone.now().year,
                }
                html = render_to_string('emails/payment_receipt.html', context)
                send_mail(
                    subject='Чек об оплате — AIEducation',
                    message='Оплата прошла успешно',
                    html_message=html,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[pay.user.email],
                    fail_silently=True,
                )
        except Exception:
            logging.exception('Не удалось отправить чек по email (simulate)')
        return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats_view(request):
    """Статистика для администраторов"""
    if not request.user.is_staff:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)
    
    stats = {
        'total_users': User.objects.count(),
        'verified_users': User.objects.filter(
            email_verification__verified_at__isnull=False
        ).count(),
        'users_with_subscription': User.objects.filter(
            subscription__is_active=True
        ).count(),
        'recent_registrations': User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).count(),
    }
    
    return Response(stats)