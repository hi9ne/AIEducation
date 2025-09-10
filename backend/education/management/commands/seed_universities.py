from django.core.management.base import BaseCommand
from django.utils import timezone
from education.models import University, Major, UniversityMajor

SAMPLE_UNIVERSITIES = [
    {
        'name': 'Politecnico di Milano',
        'country': 'Italy',
        'city': 'Milan',
        'description': 'Top technical university in Italy with strong engineering and design programs.',
        'website': 'https://www.polimi.it',
        'level': 'Top-100',
        'student_count': 47000,
        'deadline': timezone.now().date().replace(month=11, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/7/76/Politecnico_Milano_logo.png',
    },
    {
        'name': 'Sapienza University of Rome',
        'country': 'Italy',
        'city': 'Rome',
        'description': 'One of the oldest universities in the world with a wide range of programs.',
        'website': 'https://www.uniroma1.it',
        'level': 'Top-150',
        'student_count': 112000,
        'deadline': timezone.now().date().replace(month=12, day=1),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Sapienza_Universit%C3%A0_di_Roma.svg',
    },
    {
        'name': 'University of Bologna',
        'country': 'Italy',
        'city': 'Bologna',
        'description': 'Founded in 1088, the oldest university in continuous operation.',
        'website': 'https://www.unibo.it',
        'level': 'Top-200',
        'student_count': 87000,
        'deadline': timezone.now().date().replace(month=10, day=31),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Alma_Mater_Studiorum.svg',
    },
]

SAMPLE_MAJORS = [
    ('Computer Science', 'IT and computing programs'),
    ('Engineering', 'Engineering disciplines'),
    ('Design', 'Industrial and product design'),
]

class Command(BaseCommand):
    help = 'Seed sample universities and majors for the landing slider.'

    def handle(self, *args, **options):
        created_universities = 0

        # Ensure base majors exist
        major_objs = {}
        for name, desc in SAMPLE_MAJORS:
            m, _ = Major.objects.get_or_create(name=name, defaults={'description': desc, 'is_active': True})
            major_objs[name] = m

        for uni_data in SAMPLE_UNIVERSITIES:
            uni, created = University.objects.get_or_create(
                name=uni_data['name'],
                defaults={
                    'country': uni_data['country'],
                    'city': uni_data['city'],
                    'description': uni_data['description'],
                    'website': uni_data['website'],
                    'level': uni_data['level'],
                    'student_count': uni_data['student_count'],
                    'deadline': uni_data['deadline'],
                    # For demo we store absolute URL in logo field; serializer returns it via logo_url
                    'is_active': True,
                }
            )
            # If logo empty and we have a string URL, store it as text in the FileField name
            # Many storages allow setting name to a string; our serializer handles absolute URLs.
            if not uni.logo and isinstance(uni_data['logo'], str):
                # Save URL string into the underlying field without touching storage
                University.objects.filter(pk=uni.pk).update(logo=uni_data['logo'])
                uni.refresh_from_db()

            # Link a couple majors
            for major_name in ['Computer Science', 'Engineering']:
                m = major_objs[major_name]
                UniversityMajor.objects.get_or_create(university=uni, major=m, defaults={'is_active': True})

            if created:
                created_universities += 1

        self.stdout.write(self.style.SUCCESS(f"Seed complete. Universities created: {created_universities}"))
