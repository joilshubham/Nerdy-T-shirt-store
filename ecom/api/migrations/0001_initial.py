from django.db import migrations
from api.user.models import CustomUser


class Migration(migrations.Migration):
    def seed_data(apps, schema_editor):
        user = CustomUser(name = "shubham",email = "joilshubham@gmail.com",is_staff = True,is_superuser = True,phone = 8655316327,gender = "Male")
        user.set_password("joil")
        user.save()

    dependencies = [

    ]

    operations = [
        migrations.RunPython(seed_data),
    ]