from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("education", "0004_fix_university_founded_year"),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                """
                DO $$
                BEGIN
                    -- Add deadline column if it doesn't exist
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'education_university' AND column_name = 'deadline'
                    ) THEN
                        ALTER TABLE education_university ADD COLUMN deadline date NULL;
                    END IF;

                    -- Drop founded_year column if it exists
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'education_university' AND column_name = 'founded_year'
                    ) THEN
                        ALTER TABLE education_university DROP COLUMN founded_year;
                    END IF;
                END$$;
                """
            ),
            reverse_sql=(
                """
                DO $$
                BEGIN
                    -- Recreate founded_year column if needed
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'education_university' AND column_name = 'founded_year'
                    ) THEN
                        ALTER TABLE education_university ADD COLUMN founded_year integer NULL;
                    END IF;
                    -- Optionally drop deadline on reverse
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'education_university' AND column_name = 'deadline'
                    ) THEN
                        ALTER TABLE education_university DROP COLUMN deadline;
                    END IF;
                END$$;
                """
            ),
        )
    ]
