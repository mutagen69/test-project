# Generated by Django 4.1.7 on 2023-04-16 05:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customusers', '0008_authorrequest'),
    ]

    operations = [
        migrations.AlterField(
            model_name='authorrequest',
            name='status',
            field=models.BooleanField(choices=[(None, 'На рассмотрении'), (True, 'Подтверждено'), (False, 'Отклонено')], default=None, null=True),
        ),
    ]
