from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import UserEmailVerification, EmailVerificationToken, PasswordResetCode
import re


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # Нормализуем email
        value = value.lower().strip()
        
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email не найден.")
        return value


class PasswordResetVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_email(self, value):
        return value.lower().strip()

    def validate_code(self, value):
        # Проверяем что код содержит только цифры
        if not value.isdigit():
            raise serializers.ValidationError("Код должен содержать только цифры.")
        return value


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    def validate(self, attrs):
        # Позволяем вход как по username, так и по email
        username = attrs.get('username')
        password = attrs.get('password')
        
        if not username or not password:
            raise serializers.ValidationError('Необходимо указать логин и пароль.')
        
        # Если введен email, найдем пользователя по email
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username.lower())
                attrs['username'] = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError('Неверный email или пароль.')
        
        data = super().validate(attrs)
        
        # Добавляем дополнительную информацию о пользователе
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'is_email_verified': bool(
                hasattr(self.user, 'email_verification') and 
                self.user.email_verification.verified_at
            ),
            'date_joined': self.user.date_joined.isoformat(),
            'last_login': self.user.last_login.isoformat() if self.user.last_login else None,
        })
        
        return data


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate_username(self, value):
        # Проверяем длину username
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать минимум 3 символа.")
        
        if len(value) > 30:
            raise serializers.ValidationError("Имя пользователя не должно превышать 30 символов.")
        
        # Проверяем на допустимые символы
        if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
            raise serializers.ValidationError(
                "Имя пользователя может содержать только буквы, цифры, точки, дефисы и подчеркивания."
            )
        
        # Проверяем уникальность (без учета регистра)
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        
        return value

    def validate_email(self, value):
        # Нормализуем email
        value = value.lower().strip()
        
        # Дополнительная валидация email
        if len(value) > 254:
            raise serializers.ValidationError("Email слишком длинный.")
        
        # Проверяем уникальность
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Пароли не совпадают."})
        
        # Дополнительная проверка пароля
        password = attrs['password']
        if len(password) < 8:
            raise serializers.ValidationError({"password": "Пароль должен содержать минимум 8 символов."})
        
        return attrs

    def create(self, validated_data):
        # Удаляем password2 из данных
        validated_data.pop('password2', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Создаем запись для верификации email
        UserEmailVerification.objects.get_or_create(user=user)
        
        return user


class ProfileSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения профиля"""
    is_email_verified = serializers.SerializerMethodField()
    subscription_info = serializers.SerializerMethodField()
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'date_joined', 'last_login', 'is_email_verified',
            'subscription_info', 'profile_completion'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def get_is_email_verified(self, obj):
        return bool(
            hasattr(obj, 'email_verification') and 
            obj.email_verification.verified_at
        )

    def get_subscription_info(self, obj):
        try:
            sub = obj.subscription
            return {
                'plan': sub.plan,
                'is_active': sub.is_active,
                'starts_at': sub.starts_at.isoformat() if sub.starts_at else None,
                'expires_at': sub.expires_at.isoformat() if sub.expires_at else None,
                'days_left': (sub.expires_at - timezone.now()).days if sub.expires_at and sub.is_active else 0
            }
        except:
            return None

    def get_profile_completion(self, obj):
        """Подсчитываем процент заполненности профиля"""
        fields = ['username', 'email', 'first_name', 'last_name']
        filled = sum(1 for field in fields if getattr(obj, field))
        
        # Добавляем бонус за верифицированный email
        if self.get_is_email_verified(obj):
            filled += 1
            
        return int((filled / (len(fields) + 1)) * 100)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_username(self, value):
        if not value:
            return value
            
        user = self.context['request'].user
        
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать минимум 3 символа.")
        
        if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
            raise serializers.ValidationError(
                "Имя пользователя может содержать только буквы, цифры, точки, дефисы и подчеркивания."
            )
        
        if User.objects.exclude(pk=user.pk).filter(username__iexact=value).exists():
            raise serializers.ValidationError('Имя пользователя уже занято.')
        
        return value

    def validate_email(self, value):
        if not value:
            return value
            
        user = self.context['request'].user
        value = value.lower().strip()
        
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError('Email уже используется.')
        
        return value

    def update(self, instance, validated_data):
        # Если меняется email, сбрасываем верификацию
        if 'email' in validated_data and validated_data['email'] != instance.email:
            try:
                email_verification = instance.email_verification
                email_verification.verified_at = None
                email_verification.save()
            except:
                UserEmailVerification.objects.get_or_create(user=instance)
        
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Текущий пароль неверен.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password2': 'Новые пароли не совпадают.'})
        
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError({'new_password': 'Новый пароль должен отличаться от текущего.'})
        
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class EmailVerificationSerializer(serializers.Serializer):
    """Сериализатор для запроса верификации email"""
    
    def validate(self, attrs):
        user = self.context['request'].user
        
        # Проверяем, не слишком ли часто отправляются письма
        try:
            email_verification = user.email_verification
            if email_verification.last_sent_at:
                time_since_last = timezone.now() - email_verification.last_sent_at
                if time_since_last < timedelta(minutes=1):
                    raise serializers.ValidationError(
                        'Письмо можно отправить не чаще чем раз в минуту.'
                    )
        except:
            pass
        
        return attrs


class UserStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики пользователя"""
    total_users = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    users_with_subscription = serializers.IntegerField()
    recent_registrations = serializers.IntegerField()