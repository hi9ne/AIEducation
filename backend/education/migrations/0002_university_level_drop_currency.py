from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="ALTER TABLE education_university ADD COLUMN IF NOT EXISTS level varchar(50);",
                    reverse_sql="ALTER TABLE education_university DROP COLUMN IF EXISTS level;",
                ),
                migrations.RunSQL(
                    sql="ALTER TABLE education_university DROP COLUMN IF EXISTS currency;",
                    reverse_sql="ALTER TABLE education_university ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'EUR';",
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='university',
                    name='level',
                    field=models.CharField(blank=True, max_length=50),
                ),
                migrations.RemoveField(
                    model_name='university',
                    name='currency',
                ),
            ],
        ),
    ]
