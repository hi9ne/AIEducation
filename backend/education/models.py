from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class University(models.Model):
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    description = models.TextField()
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='universities/', null=True, blank=True)
    level = models.CharField(max_length=50, blank=True)
    student_count = models.IntegerField(null=True, blank=True)
    # Application submission deadline (replaces founded_year)
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.country})"

    class Meta:
        verbose_name_plural = "Universities"


class StudentProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    ielts_completed = models.BooleanField(default=False)
    dov_completed = models.BooleanField(default=False)
    universities_selected = models.BooleanField(default=False)
    universitaly_registration = models.BooleanField(default=False)
    visa_obtained = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def calculate_progress(self):
        total_steps = 5  # Total number of steps
        completed_steps = sum([
            self.ielts_completed,
            self.dov_completed,
            self.universities_selected,
            self.universitaly_registration,
            self.visa_obtained
        ])
        return (completed_steps / total_steps) * 100

    def __str__(self):
        return f"Progress for {self.user.username}"


class Major(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UniversityMajor(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='majors')
    major = models.ForeignKey(Major, on_delete=models.CASCADE)
    duration_years = models.IntegerField(default=3)
    language = models.CharField(max_length=50, default='English')
    requirements = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.university.name} - {self.major.name}"

    class Meta:
        unique_together = ['university', 'major']


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='courses')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='courses')
    instructor = models.CharField(max_length=200, blank=True)
    duration_weeks = models.IntegerField(default=12)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_free = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.university.name}"


class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.course.title}"

    class Meta:
        unique_together = ['user', 'course']


class Application(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='applications')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    motivation_letter = models.TextField()
    documents = models.JSONField(default=list, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.university.name}"

    class Meta:
        unique_together = ['user', 'university', 'major']


class Achievement(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=100, blank=True)
    points = models.IntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"

    class Meta:
        unique_together = ['user', 'achievement']


class AIRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_recommendations')
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=100)
    priority = models.IntegerField(default=1)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"


class StudyPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_university = models.ForeignKey(University, on_delete=models.CASCADE, null=True, blank=True)
    target_major = models.ForeignKey(Major, on_delete=models.CASCADE, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"


class StudyPlanItem(models.Model):
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.study_plan.title} - {self.title}"

    class Meta:
        ordering = ['order', 'due_date']


class Document(models.Model):
    DOCUMENT_TYPES = [
        ('passport', 'Passport'),
        ('diploma', 'Diploma'),
        ('transcript', 'Transcript'),
        ('language_certificate', 'Language Certificate'),
        ('motivation_letter', 'Motivation Letter'),
        ('cv', 'CV'),
        ('recommendation_letter', 'Recommendation Letter'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=200)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='documents/')
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.name}"


class UserEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'id']

    def __str__(self):
        return f"{self.user.email} - {self.title} ({self.date})"