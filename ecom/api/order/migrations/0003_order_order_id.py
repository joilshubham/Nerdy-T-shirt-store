# Generated by Django 3.1.7 on 2021-04-04 07:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0002_order_is_paid'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='order_id',
            field=models.CharField(default=0, max_length=150),
        ),
    ]
