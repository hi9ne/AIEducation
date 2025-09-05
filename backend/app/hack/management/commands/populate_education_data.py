from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from hack.education_models import (
    University, Major, UniversityMajor, Document, StudentProfile
)


class Command(BaseCommand):
    help = 'Populate database with initial education data'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate education data...')
        
        # Create universities
        self.create_universities()
        
        # Create majors
        self.create_majors()
        
        # Create university-major relationships
        self.create_university_majors()
        
        # Create documents
        self.create_documents()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated education data!')
        )

    def create_universities(self):
        """Create Italian universities"""
        universities_data = [
            {
                'name': 'University of Bologna',
                'name_italian': 'Università di Bologna',
                'city': 'Bologna',
                'region': 'Emilia-Romagna',
                'website': 'https://www.unibo.it',
                'ranking_italy': 1,
                'ranking_world': 160,
                'founded_year': 1088,
                'student_count': 90000,
                'ielts_min': 6.0,
                'toefl_min': 80,
                'italian_level_min': 'B2',
                'tuition_fee_eu': 2000,
                'tuition_fee_non_eu': 2000,
                'living_cost_monthly': 800,
                'has_scholarships': True,
                'scholarship_info': 'Merit-based scholarships available',
                'application_deadline': date(2024, 3, 31),
                'scholarship_deadline': date(2024, 2, 28),
            },
            {
                'name': 'Sapienza University of Rome',
                'name_italian': 'Sapienza Università di Roma',
                'city': 'Rome',
                'region': 'Lazio',
                'website': 'https://www.uniroma1.it',
                'ranking_italy': 2,
                'ranking_world': 171,
                'founded_year': 1303,
                'student_count': 110000,
                'ielts_min': 6.5,
                'toefl_min': 90,
                'italian_level_min': 'B2',
                'tuition_fee_eu': 1500,
                'tuition_fee_non_eu': 1500,
                'living_cost_monthly': 1000,
                'has_scholarships': True,
                'scholarship_info': 'Need-based and merit scholarships',
                'application_deadline': date(2024, 4, 15),
                'scholarship_deadline': date(2024, 3, 15),
            },
            {
                'name': 'University of Milan',
                'name_italian': 'Università degli Studi di Milano',
                'city': 'Milan',
                'region': 'Lombardy',
                'website': 'https://www.unimi.it',
                'ranking_italy': 3,
                'ranking_world': 301,
                'founded_year': 1924,
                'student_count': 60000,
                'ielts_min': 6.0,
                'toefl_min': 80,
                'italian_level_min': 'B1',
                'tuition_fee_eu': 2500,
                'tuition_fee_non_eu': 2500,
                'living_cost_monthly': 1200,
                'has_scholarships': True,
                'scholarship_info': 'International student scholarships',
                'application_deadline': date(2024, 5, 31),
                'scholarship_deadline': date(2024, 4, 30),
            },
            {
                'name': 'University of Florence',
                'name_italian': 'Università degli Studi di Firenze',
                'city': 'Florence',
                'region': 'Tuscany',
                'website': 'https://www.unifi.it',
                'ranking_italy': 4,
                'ranking_world': 401,
                'founded_year': 1321,
                'student_count': 50000,
                'ielts_min': 5.5,
                'toefl_min': 72,
                'italian_level_min': 'B1',
                'tuition_fee_eu': 1800,
                'tuition_fee_non_eu': 1800,
                'living_cost_monthly': 900,
                'has_scholarships': True,
                'scholarship_info': 'Regional scholarships available',
                'application_deadline': date(2024, 4, 30),
                'scholarship_deadline': date(2024, 3, 31),
            },
            {
                'name': 'University of Turin',
                'name_italian': 'Università degli Studi di Torino',
                'city': 'Turin',
                'region': 'Piedmont',
                'website': 'https://www.unito.it',
                'ranking_italy': 5,
                'ranking_world': 501,
                'founded_year': 1404,
                'student_count': 80000,
                'ielts_min': 5.5,
                'toefl_min': 72,
                'italian_level_min': 'B1',
                'tuition_fee_eu': 1600,
                'tuition_fee_non_eu': 1600,
                'living_cost_monthly': 700,
                'has_scholarships': True,
                'scholarship_info': 'Piedmont region scholarships',
                'application_deadline': date(2024, 5, 15),
                'scholarship_deadline': date(2024, 4, 15),
            },
        ]

        for uni_data in universities_data:
            university, created = University.objects.get_or_create(
                name=uni_data['name'],
                defaults=uni_data
            )
            if created:
                self.stdout.write(f'Created university: {university.name}')
            else:
                self.stdout.write(f'University already exists: {university.name}')

    def create_majors(self):
        """Create study majors"""
        majors_data = [
            # Engineering
            {'name': 'Computer Engineering', 'name_italian': 'Ingegneria Informatica', 'category': 'Engineering', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Mechanical Engineering', 'name_italian': 'Ingegneria Meccanica', 'category': 'Engineering', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Civil Engineering', 'name_italian': 'Ingegneria Civile', 'category': 'Engineering', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Electrical Engineering', 'name_italian': 'Ingegneria Elettrica', 'category': 'Engineering', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Aerospace Engineering', 'name_italian': 'Ingegneria Aerospaziale', 'category': 'Engineering', 'degree_type': 'bachelor', 'duration_years': 3},
            
            # Medicine
            {'name': 'Medicine and Surgery', 'name_italian': 'Medicina e Chirurgia', 'category': 'Medicine', 'degree_type': 'bachelor', 'duration_years': 6},
            {'name': 'Dentistry', 'name_italian': 'Odontoiatria', 'category': 'Medicine', 'degree_type': 'bachelor', 'duration_years': 6},
            {'name': 'Pharmacy', 'name_italian': 'Farmacia', 'category': 'Medicine', 'degree_type': 'bachelor', 'duration_years': 5},
            {'name': 'Nursing', 'name_italian': 'Infermieristica', 'category': 'Medicine', 'degree_type': 'bachelor', 'duration_years': 3},
            
            # Business
            {'name': 'Business Administration', 'name_italian': 'Economia Aziendale', 'category': 'Business', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Economics', 'name_italian': 'Economia', 'category': 'Business', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'International Business', 'name_italian': 'Economia Internazionale', 'category': 'Business', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Marketing', 'name_italian': 'Marketing', 'category': 'Business', 'degree_type': 'bachelor', 'duration_years': 3},
            
            # Arts & Humanities
            {'name': 'Literature', 'name_italian': 'Lettere', 'category': 'Arts', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'History', 'name_italian': 'Storia', 'category': 'Arts', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Philosophy', 'name_italian': 'Filosofia', 'category': 'Arts', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Art History', 'name_italian': 'Storia dell\'Arte', 'category': 'Arts', 'degree_type': 'bachelor', 'duration_years': 3},
            
            # Sciences
            {'name': 'Mathematics', 'name_italian': 'Matematica', 'category': 'Sciences', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Physics', 'name_italian': 'Fisica', 'category': 'Sciences', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Chemistry', 'name_italian': 'Chimica', 'category': 'Sciences', 'degree_type': 'bachelor', 'duration_years': 3},
            {'name': 'Biology', 'name_italian': 'Biologia', 'category': 'Sciences', 'degree_type': 'bachelor', 'duration_years': 3},
            
            # Master's programs
            {'name': 'Computer Science (Master)', 'name_italian': 'Informatica (Laurea Magistrale)', 'category': 'Engineering', 'degree_type': 'master', 'duration_years': 2},
            {'name': 'Data Science (Master)', 'name_italian': 'Data Science (Laurea Magistrale)', 'category': 'Engineering', 'degree_type': 'master', 'duration_years': 2},
            {'name': 'International Business (Master)', 'name_italian': 'Economia Internazionale (Laurea Magistrale)', 'category': 'Business', 'degree_type': 'master', 'duration_years': 2},
            {'name': 'Public Health (Master)', 'name_italian': 'Sanità Pubblica (Laurea Magistrale)', 'category': 'Medicine', 'degree_type': 'master', 'duration_years': 2},
        ]

        for major_data in majors_data:
            major, created = Major.objects.get_or_create(
                name=major_data['name'],
                defaults=major_data
            )
            if created:
                self.stdout.write(f'Created major: {major.name}')
            else:
                self.stdout.write(f'Major already exists: {major.name}')

    def create_university_majors(self):
        """Create university-major relationships"""
        universities = University.objects.all()
        majors = Major.objects.all()
        
        # Create relationships for all universities and majors
        for university in universities:
            for major in majors:
                university_major, created = UniversityMajor.objects.get_or_create(
                    university=university,
                    major=major,
                    defaults={
                        'is_available': True,
                        'seats_available': 50  # Default seats
                    }
                )
                if created:
                    self.stdout.write(f'Created relationship: {university.name} - {major.name}')

    def create_documents(self):
        """Create required documents"""
        documents_data = [
            # Academic documents
            {'name': 'High School Diploma', 'description': 'Аттестат о среднем образовании', 'category': 'academic', 'is_required': True},
            {'name': 'High School Transcript', 'description': 'Выписка оценок за среднюю школу', 'category': 'academic', 'is_required': True},
            {'name': 'University Transcript', 'description': 'Выписка оценок из университета (если есть)', 'category': 'academic', 'is_required': False},
            {'name': 'University Diploma', 'description': 'Диплом университета (если есть)', 'category': 'academic', 'is_required': False},
            
            # Language certificates
            {'name': 'IELTS Certificate', 'description': 'Сертификат IELTS', 'category': 'language', 'is_required': True},
            {'name': 'TOEFL Certificate', 'description': 'Сертификат TOEFL (альтернатива IELTS)', 'category': 'language', 'is_required': False},
            {'name': 'Italian Language Certificate', 'description': 'Сертификат знания итальянского языка', 'category': 'language', 'is_required': False},
            
            # Personal documents
            {'name': 'Passport', 'description': 'Паспорт', 'category': 'personal', 'is_required': True},
            {'name': 'Birth Certificate', 'description': 'Свидетельство о рождении', 'category': 'personal', 'is_required': True},
            {'name': 'Photo', 'description': 'Фотография 3x4', 'category': 'personal', 'is_required': True},
            {'name': 'CV/Resume', 'description': 'Резюме', 'category': 'personal', 'is_required': True},
            {'name': 'Motivation Letter', 'description': 'Мотивационное письмо', 'category': 'personal', 'is_required': True},
            {'name': 'Recommendation Letters', 'description': 'Рекомендательные письма', 'category': 'personal', 'is_required': False},
            
            # Financial documents
            {'name': 'Bank Statement', 'description': 'Справка из банка о наличии средств', 'category': 'financial', 'is_required': True},
            {'name': 'Financial Guarantee', 'description': 'Финансовые гарантии', 'category': 'financial', 'is_required': True},
            {'name': 'Scholarship Certificate', 'description': 'Справка о стипендии (если есть)', 'category': 'financial', 'is_required': False},
            
            # Visa documents
            {'name': 'Visa Application Form', 'description': 'Заявление на визу', 'category': 'visa', 'is_required': True},
            {'name': 'Health Insurance', 'description': 'Медицинская страховка', 'category': 'visa', 'is_required': True},
            {'name': 'Accommodation Proof', 'description': 'Документы о проживании в Италии', 'category': 'visa', 'is_required': True},
        ]

        for doc_data in documents_data:
            document, created = Document.objects.get_or_create(
                name=doc_data['name'],
                defaults=doc_data
            )
            if created:
                self.stdout.write(f'Created document: {document.name}')
            else:
                self.stdout.write(f'Document already exists: {document.name}')
