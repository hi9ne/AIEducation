#!/usr/bin/env python
import os
import django
from django.conf import settings

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aieducation.settings')
django.setup()

from django.contrib.auth import get_user_model
from education.models import *
from accounts.models import UserProfile
from payments.models import *
from notifications.models import *

User = get_user_model()

def create_test_data():
    print("Создание тестовых данных...")
    
    # Создаем пользователя
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'is_verified': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"Создан пользователь: {user.email}")
    
    # Создаем профиль пользователя
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'bio': 'Студент, изучающий зарубежное образование',
            'interests': ['Computer Science', 'Engineering', 'Medicine'],
            'goals': ['Поступить в итальянский университет', 'Изучить итальянский язык'],
            'language_levels': {'English': 'B2', 'Italian': 'A1'},
            'preferred_countries': ['Italy', 'Germany', 'France'],
            'budget_range': '2000-5000 EUR',
            'study_duration': '3-4 years'
        }
    )
    if created:
        print(f"Создан профиль для: {user.email}")
    
    # Создаем специальности
    majors_data = [
        {'name': 'Computer Science', 'description': 'Информатика и компьютерные науки', 'category': 'Technology'},
        {'name': 'Engineering', 'description': 'Инженерия', 'category': 'Technology'},
        {'name': 'Medicine', 'description': 'Медицина', 'category': 'Health'},
        {'name': 'Business', 'description': 'Бизнес и менеджмент', 'category': 'Business'},
        {'name': 'Art', 'description': 'Искусство и дизайн', 'category': 'Arts'},
        {'name': 'Architecture', 'description': 'Архитектура', 'category': 'Design'},
        {'name': 'Literature', 'description': 'Литература', 'category': 'Humanities'},
        {'name': 'Economics', 'description': 'Экономика', 'category': 'Social Sciences'},
    ]
    
    for major_data in majors_data:
        major, created = Major.objects.get_or_create(
            name=major_data['name'],
            defaults=major_data
        )
        if created:
            print(f"Создана специальность: {major.name}")
    
    # Создаем университеты
    universities_data = [
        {
            'name': 'University of Bologna',
            'country': 'Italy',
            'city': 'Bologna',
            'description': 'Старейший университет в мире, основан в 1088 году. Ведущий исследовательский университет с богатой историей и традициями.',
            'website': 'https://www.unibo.it',
            'ranking': 160,
            'tuition_fee': 2000,
            'student_count': 87000,
            'founded_year': 1088
        },
        {
            'name': 'Sapienza University of Rome',
            'country': 'Italy',
            'city': 'Rome',
            'description': 'Крупнейший университет в Европе, основан в 1303 году. Один из самых престижных университетов Италии.',
            'website': 'https://www.uniroma1.it',
            'ranking': 171,
            'tuition_fee': 1500,
            'student_count': 112000,
            'founded_year': 1303
        },
        {
            'name': 'University of Milan',
            'country': 'Italy',
            'city': 'Milan',
            'description': 'Ведущий исследовательский университет в Милане. Специализируется на медицине, бизнесе и инженерии.',
            'website': 'https://www.unimi.it',
            'ranking': 301,
            'tuition_fee': 2500,
            'student_count': 60000,
            'founded_year': 1924
        },
        {
            'name': 'University of Florence',
            'country': 'Italy',
            'city': 'Florence',
            'description': 'Университет в сердце Возрождения. Специализируется на искусстве, архитектуре и гуманитарных науках.',
            'website': 'https://www.unifi.it',
            'ranking': 401,
            'tuition_fee': 1800,
            'student_count': 51000,
            'founded_year': 1321
        },
        {
            'name': 'Technical University of Munich',
            'country': 'Germany',
            'city': 'Munich',
            'description': 'Один из ведущих технических университетов мира. Специализируется на инженерии и технологиях.',
            'website': 'https://www.tum.de',
            'ranking': 50,
            'tuition_fee': 0,
            'student_count': 42000,
            'founded_year': 1868
        }
    ]
    
    for uni_data in universities_data:
        university, created = University.objects.get_or_create(
            name=uni_data['name'],
            defaults=uni_data
        )
        if created:
            print(f"Создан университет: {university.name}")
    
    # Создаем связи университет-специальность
    university_majors = [
        ('University of Bologna', ['Computer Science', 'Engineering', 'Medicine', 'Business']),
        ('Sapienza University of Rome', ['Architecture', 'Engineering', 'Literature', 'Medicine']),
        ('University of Milan', ['Business', 'Economics', 'Medicine', 'Computer Science']),
        ('University of Florence', ['Art', 'History', 'Architecture', 'Literature']),
        ('Technical University of Munich', ['Engineering', 'Computer Science', 'Architecture'])
    ]
    
    for uni_name, major_names in university_majors:
        try:
            university = University.objects.get(name=uni_name)
            for major_name in major_names:
                try:
                    major = Major.objects.get(name=major_name)
                    UniversityMajor.objects.get_or_create(
                        university=university,
                        major=major,
                        defaults={
                            'duration_years': 3,
                            'language': 'English',
                            'requirements': 'High school diploma, language certificate'
                        }
                    )
                except Major.DoesNotExist:
                    pass
        except University.DoesNotExist:
            pass
    
    # Создаем курсы
    courses_data = [
        {
            'title': 'Introduction to Computer Science',
            'description': 'Основы программирования и алгоритмов',
            'university': 'University of Bologna',
            'major': 'Computer Science',
            'instructor': 'Prof. Mario Rossi',
            'duration_weeks': 12,
            'difficulty_level': 'beginner',
            'price': 0,
            'is_free': True
        },
        {
            'title': 'Advanced Programming',
            'description': 'Продвинутое программирование на Python и Java',
            'university': 'University of Bologna',
            'major': 'Computer Science',
            'instructor': 'Prof. Anna Bianchi',
            'duration_weeks': 16,
            'difficulty_level': 'intermediate',
            'price': 500,
            'is_free': False
        },
        {
            'title': 'Medical Anatomy',
            'description': 'Анатомия человека для студентов-медиков',
            'university': 'University of Milan',
            'major': 'Medicine',
            'instructor': 'Prof. Giuseppe Verdi',
            'duration_weeks': 20,
            'difficulty_level': 'advanced',
            'price': 800,
            'is_free': False
        }
    ]
    
    for course_data in courses_data:
        try:
            university = University.objects.get(name=course_data['university'])
            major = Major.objects.get(name=course_data['major'])
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                university=university,
                defaults={
                    'description': course_data['description'],
                    'major': major,
                    'instructor': course_data['instructor'],
                    'duration_weeks': course_data['duration_weeks'],
                    'difficulty_level': course_data['difficulty_level'],
                    'price': course_data['price'],
                    'is_free': course_data['is_free']
                }
            )
            if created:
                print(f"Создан курс: {course.title}")
        except (University.DoesNotExist, Major.DoesNotExist):
            pass
    
    # Создаем достижения
    achievements_data = [
        {'name': 'Новичок', 'description': 'Первый вход в систему', 'icon': '🎉', 'points': 10, 'category': 'general'},
        {'name': 'Исследователь', 'description': 'Просмотрел 10 университетов', 'icon': '🔍', 'points': 25, 'category': 'exploration'},
        {'name': 'Студент', 'description': 'Записался на первый курс', 'icon': '📚', 'points': 50, 'category': 'learning'},
        {'name': 'Полиглот', 'description': 'Изучил 3 языка', 'icon': '🌍', 'points': 100, 'category': 'language'},
        {'name': 'Абитуриент', 'description': 'Подал первую заявку', 'icon': '📝', 'points': 75, 'category': 'application'},
    ]
    
    for achievement_data in achievements_data:
        achievement, created = Achievement.objects.get_or_create(
            name=achievement_data['name'],
            defaults=achievement_data
        )
        if created:
            print(f"Создано достижение: {achievement.name}")
    
    # Создаем достижения пользователя
    UserAchievement.objects.get_or_create(
        user=user,
        achievement=Achievement.objects.get(name='Новичок')
    )
    UserAchievement.objects.get_or_create(
        user=user,
        achievement=Achievement.objects.get(name='Исследователь')
    )
    
    # Создаем AI рекомендации
    recommendations_data = [
        {
            'title': 'Рекомендуемые университеты',
            'content': 'На основе ваших интересов рекомендуем рассмотреть университеты в Италии: University of Bologna и University of Milan.',
            'category': 'university',
            'priority': 1
        },
        {
            'title': 'Подготовка к IELTS',
            'content': 'Начните подготовку к IELTS за 6 месяцев до подачи заявки. Рекомендуемый балл: 6.5+',
            'category': 'preparation',
            'priority': 2
        },
        {
            'title': 'Сбор документов',
            'content': 'Подготовьте все необходимые документы: диплом, транскрипт, мотивационное письмо.',
            'category': 'documents',
            'priority': 3
        }
    ]
    
    for rec_data in recommendations_data:
        AIRecommendation.objects.get_or_create(
            user=user,
            title=rec_data['title'],
            defaults=rec_data
        )
    
    # Создаем уведомления
    notifications_data = [
        {
            'title': 'Добро пожаловать!',
            'message': 'Начните свой путь к успеху в образовании за рубежом.',
            'notification_type': 'info'
        },
        {
            'title': 'Новое достижение!',
            'message': 'Вы получили значок "Новичок".',
            'notification_type': 'achievement'
        },
        {
            'title': 'Напоминание',
            'message': 'Заполните профиль для персонализированных рекомендаций.',
            'notification_type': 'warning'
        }
    ]
    
    for notif_data in notifications_data:
        Notification.objects.get_or_create(
            user=user,
            title=notif_data['title'],
            defaults=notif_data
        )
    
    # Создаем планы подписки
    plans_data = [
        {
            'name': 'Базовый',
            'description': 'Доступ к базовым функциям',
            'price': 9.99,
            'duration_days': 30,
            'features': ['Поиск университетов', 'Базовые рекомендации']
        },
        {
            'name': 'Премиум',
            'description': 'Полный доступ ко всем функциям',
            'price': 19.99,
            'duration_days': 30,
            'features': ['Все функции Базового', 'AI рекомендации', 'Персональный менеджер']
        },
        {
            'name': 'Годовой',
            'description': 'Годовая подписка со скидкой',
            'price': 199.99,
            'duration_days': 365,
            'features': ['Все функции Премиум', 'Приоритетная поддержка', 'Эксклюзивные материалы']
        }
    ]
    
    for plan_data in plans_data:
        plan, created = SubscriptionPlan.objects.get_or_create(
            name=plan_data['name'],
            defaults=plan_data
        )
        if created:
            print(f"Создан план подписки: {plan.name}")
    
    print("Тестовые данные успешно созданы!")

if __name__ == '__main__':
    create_test_data()
