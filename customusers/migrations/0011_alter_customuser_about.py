# Generated by Django 4.1.7 on 2023-04-16 06:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customusers', '0010_customuser_about'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='about',
            field=models.TextField(default='', max_length=3000, verbose_name='Об авторе'),
        ),
    ]
