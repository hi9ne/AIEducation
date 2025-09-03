from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import PasswordResetCode, Payment, Subscription, UserEmailVerification, EmailVerificationToken
from .serializers import (
    RegisterSerializer, 
    MyTokenObtainPairSerializer, 
    PasswordResetRequestSerializer,
    PasswordResetVerifySerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
)
from .freedompay import process_freedompay_payment, generate_payment_link
import logging
import uuid
import os
import hashlib
from django.db import transaction
from django.utils.crypto import get_random_string
from django.urls import reverse

class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({"message": "You are authenticated!"})

class PasswordResetRequestView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate and save reset code
        code = PasswordResetCode.generate_code()
        PasswordResetCode.objects.create(user=user, code=code)
        
        # Prepare email
        html_message = render_to_string('emails/password_reset.html', {'code': code})
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject='Password Reset Code',
            message=plain_message,
            html_message=html_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return Response(
            {"message": "Password reset code has been sent to your email"},
            status=status.HTTP_200_OK
        )

class PasswordResetVerifyView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetVerifySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']
        
        user = User.objects.get(email=email)
        
        # Check if code exists and is valid
        reset_code = PasswordResetCode.objects.filter(
            user=user,
            code=code,
            is_used=False,
            created_at__gte=timezone.now() - timedelta(minutes=30)
        ).first()
        
        if not reset_code:
            return Response(
                {"error": "Invalid or expired code"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password and mark code as used
        user.set_password(new_password)
        user.save()
        reset_code.is_used = True
        reset_code.save()
        
        return Response(
            {"message": "Password has been reset successfully"},
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    def post(self, request):
        # Просто для фронта: удаление refresh токена на клиенте
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            sub = user.subscription
        except Subscription.DoesNotExist:
            sub = None
        subscription = None
        if sub:
            subscription = {
                'plan': sub.plan,
                'is_active': sub.is_active,
                'starts_at': sub.starts_at.isoformat() if sub.starts_at else None,
                'expires_at': sub.expires_at.isoformat() if sub.expires_at else None,
            }
        email_verified = bool(getattr(user, 'email_verification', None) and user.email_verification.verified_at)
        return Response({
            'username': user.username,
            'email': user.email,
            'email_verified': email_verified,
            'subscription': subscription,
        })

class ProfileUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully'})

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
                        subject='Чек об оплате — TapZar',
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
                    subject='Чек об оплате — TapZar',
                    message='Оплата прошла успешно',
                    html_message=html,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[pay.user.email],
                    fail_silently=True,
                )
        except Exception:
            logging.exception('Не удалось отправить чек по email (simulate)')
        return Response({'status': 'ok'})

class EmailVerifyRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        ev, _ = UserEmailVerification.objects.get_or_create(user=user)
        token = get_random_string(48)
        EmailVerificationToken.objects.create(user=user, token=token)
        verify_link = request.build_absolute_uri(reverse('email-verify') + f'?token={token}')
        html = render_to_string('emails/email_verify.html', { 'username': user.username, 'verify_link': verify_link, 'year': timezone.now().year })
        send_mail(
            subject='Подтверждение почты — TapZar',
            message=f'Подтвердите вашу почту по ссылке: {verify_link}',
            html_message=html,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        ev.last_sent_at = timezone.now()
        ev.save(update_fields=['last_sent_at'])
        return Response({'detail': 'Письмо отправлено'})

class EmailVerifyView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response({'detail': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)
        et = EmailVerificationToken.objects.filter(token=token, used_at__isnull=True).first()
        if not et:
            return Response({'detail': 'invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        ev, _ = UserEmailVerification.objects.get_or_create(user=et.user)
        ev.verified_at = timezone.now()
        ev.save(update_fields=['verified_at'])
        et.used_at = timezone.now()
        et.save(update_fields=['used_at'])
        # Можно редиректить на фронт-страницу успеха
        return Response({'detail': 'Email verified'})