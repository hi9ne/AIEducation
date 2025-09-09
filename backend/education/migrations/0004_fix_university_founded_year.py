from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('education', '0003_merge_20250909_1819'),
    ]

    operations = [
        # Database-only migration to ensure founded_year column exists
        migrations.RunSQL(
            sql=(
                "ALTER TABLE education_university "
                "ADD COLUMN IF NOT EXISTS founded_year integer NULL;"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
