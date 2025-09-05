from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import uuid


class StudentProfile(models.Model):
    """Профиль студента для поступления в Италию"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    
    # Личные данные
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField()
    nationality = models.CharField(max_length=100, default='Kazakhstan')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Образование
    education_level = models.CharField(
        max_length=20,
        choices=[
            ('high_school', '12 класс'),
            ('university_1', '1 курс университета'),
            ('university_2', '2 курс университета'),
            ('university_3', '3 курс университета'),
            ('university_4', '4 курс университета'),
            ('bachelor', 'Бакалавр'),
            ('master', 'Магистр'),
        ],
        default='high_school'
    )
    current_school = models.CharField(max_length=200, blank=True)
    graduation_year = models.IntegerField(blank=True, null=True)
    
    # Языковые сертификаты
    ielts_score = models.FloatField(blank=True, null=True)
    ielts_date = models.DateField(blank=True, null=True)
    toefl_score = models.IntegerField(blank=True, null=True)
    toefl_date = models.DateField(blank=True, null=True)
    italian_level = models.CharField(
        max_length=20,
        choices=[
            ('A1', 'A1 - Начальный'),
            ('A2', 'A2 - Элементарный'),
            ('B1', 'B1 - Средний'),
            ('B2', 'B2 - Выше среднего'),
            ('C1', 'C1 - Продвинутый'),
            ('C2', 'C2 - Владение'),
        ],
        blank=True
    )
    
    # Академические предпочтения
    preferred_majors = models.JSONField(default=list, blank=True)
    preferred_cities = models.JSONField(default=list, blank=True)
    budget_min = models.IntegerField(blank=True, null=True)
    budget_max = models.IntegerField(blank=True, null=True)
    
    # Прогресс
    current_step = models.CharField(
        max_length=50,
        choices=[
            ('profile', 'Заполнение профиля'),
            ('ielts', 'Подготовка к IELTS'),
            ('tolc', 'Подготовка к TOLC'),
            ('universities', 'Выбор университетов'),
            ('universitaly', 'Регистрация в Universitaly'),
            ('codice', 'Получение Codice Fiscale'),
            ('dov', 'Легализация документов'),
            ('visa', 'Получение визы'),
            ('completed', 'Завершено'),
        ],
        default='profile'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.current_step}"
    
    def get_progress_percentage(self):
        """Возвращает процент завершения процесса"""
        steps = [
            'profile', 'ielts', 'tolc', 'universities', 
            'universitaly', 'codice', 'dov', 'visa', 'completed'
        ]
        try:
            current_index = steps.index(self.current_step)
            return int((current_index / (len(steps) - 1)) * 100)
        except ValueError:
            return 0


class University(models.Model):
    """Университеты Италии"""
    name = models.CharField(max_length=200)
    name_italian = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    logo = models.URLField(blank=True)
    
    # Рейтинг и информация
    ranking_italy = models.IntegerField(blank=True, null=True)
    ranking_world = models.IntegerField(blank=True, null=True)
    founded_year = models.IntegerField(blank=True, null=True)
    student_count = models.IntegerField(blank=True, null=True)
    
    # Требования
    ielts_min = models.FloatField(blank=True, null=True)
    toefl_min = models.IntegerField(blank=True, null=True)
    italian_level_min = models.CharField(max_length=10, blank=True)
    
    # Стоимость
    tuition_fee_eu = models.IntegerField(blank=True, null=True)
    tuition_fee_non_eu = models.IntegerField(blank=True, null=True)
    living_cost_monthly = models.IntegerField(blank=True, null=True)
    
    # Стипендии
    has_scholarships = models.BooleanField(default=False)
    scholarship_info = models.TextField(blank=True)
    
    # Дедлайны
    application_deadline = models.DateField(blank=True, null=True)
    scholarship_deadline = models.DateField(blank=True, null=True)
    
    # Статус
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.city}"
    
    def get_tuition_for_student(self, is_eu_citizen=False):
        """Возвращает стоимость обучения для студента"""
        if is_eu_citizen:
            return self.tuition_fee_eu
        return self.tuition_fee_non_eu


class Major(models.Model):
    """Направления обучения"""
    name = models.CharField(max_length=200)
    name_italian = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100)  # Engineering, Medicine, etc.
    duration_years = models.IntegerField(default=3)
    degree_type = models.CharField(
        max_length=20,
        choices=[
            ('bachelor', 'Бакалавриат'),
            ('master', 'Магистратура'),
            ('phd', 'Докторантура'),
        ]
    )
    
    def __str__(self):
        return f"{self.name} ({self.degree_type})"


class UniversityMajor(models.Model):
    """Связь университетов и направлений"""
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='majors')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='universities')
    is_available = models.BooleanField(default=True)
    seats_available = models.IntegerField(blank=True, null=True)
    
    class Meta:
        unique_together = ['university', 'major']
    
    def __str__(self):
        return f"{self.university.name} - {self.major.name}"


class StudentApplication(models.Model):
    """Заявки студентов в университеты"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='applications')
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='applications')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='applications')
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Черновик'),
            ('submitted', 'Подана'),
            ('under_review', 'На рассмотрении'),
            ('accepted', 'Принята'),
            ('rejected', 'Отклонена'),
            ('waitlisted', 'В резерве'),
        ],
        default='draft'
    )
    
    application_date = models.DateTimeField(blank=True, null=True)
    response_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student} -> {self.university.name} ({self.major.name})"


class Document(models.Model):
    """Документы для поступления"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_required = models.BooleanField(default=True)
    category = models.CharField(
        max_length=50,
        choices=[
            ('academic', 'Академические'),
            ('language', 'Языковые'),
            ('personal', 'Личные'),
            ('financial', 'Финансовые'),
            ('visa', 'Визовые'),
        ]
    )
    
    def __str__(self):
        return self.name


class StudentDocument(models.Model):
    """Документы студента"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='documents')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='student_documents')
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('not_started', 'Не начато'),
            ('in_progress', 'В процессе'),
            ('completed', 'Завершено'),
            ('verified', 'Проверено'),
            ('rejected', 'Отклонено'),
        ],
        default='not_started'
    )
    
    file_url = models.URLField(blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(blank=True, null=True)
    uploaded_at = models.DateTimeField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student} - {self.document.name}"


class ProgressStep(models.Model):
    """Шаги процесса поступления"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='progress_steps')
    step_name = models.CharField(max_length=50)
    step_description = models.TextField(blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('not_started', 'Не начато'),
            ('in_progress', 'В процессе'),
            ('completed', 'Завершено'),
            ('skipped', 'Пропущено'),
        ],
        default='not_started'
    )
    
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student} - {self.step_name} ({self.status})"


class AIRecommendation(models.Model):
    """AI рекомендации для студентов"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='ai_recommendations')
    recommendation_type = models.CharField(
        max_length=50,
        choices=[
            ('university', 'Рекомендация университета'),
            ('major', 'Рекомендация направления'),
            ('document', 'Рекомендация по документам'),
            ('timeline', 'Рекомендация по срокам'),
            ('general', 'Общая рекомендация'),
        ]
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Низкий'),
            ('medium', 'Средний'),
            ('high', 'Высокий'),
            ('urgent', 'Срочно'),
        ],
        default='medium'
    )
    
    is_read = models.BooleanField(default=False)
    is_applied = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student} - {self.title}"


class Notification(models.Model):
    """Уведомления для студентов"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ('deadline', 'Дедлайн'),
            ('reminder', 'Напоминание'),
            ('update', 'Обновление'),
            ('achievement', 'Достижение'),
            ('system', 'Системное'),
        ]
    )
    
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.student} - {self.title}"


class Achievement(models.Model):
    """Достижения студентов"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(
        max_length=50,
        choices=[
            ('profile_completed', 'Профиль завершен'),
            ('ielts_passed', 'IELTS сдан'),
            ('tolc_passed', 'TOLC сдан'),
            ('university_applied', 'Подана заявка в университет'),
            ('document_uploaded', 'Документ загружен'),
            ('visa_obtained', 'Виза получена'),
            ('streak_7', '7 дней подряд'),
            ('streak_30', '30 дней подряд'),
        ]
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    points = models.IntegerField(default=10)
    icon = models.CharField(max_length=50, default='trophy')
    
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student} - {self.title}"


class StudyPlan(models.Model):
    """План обучения для студентов"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='study_plans')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student} - {self.title}"


class StudyPlanItem(models.Model):
    """Элементы плана обучения"""
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'due_date']
    
    def __str__(self):
        return f"{self.study_plan.title} - {self.title}"
