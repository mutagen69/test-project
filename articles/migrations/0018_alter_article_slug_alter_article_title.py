# Generated by Django 4.1.7 on 2023-03-22 10:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0017_alter_article_category_alter_article_slug_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='slug',
            field=models.SlugField(auto_created=True, editable=False, max_length=100),
        ),
        migrations.AlterField(
            model_name='article',
            name='title',
            field=models.CharField(max_length=100, verbose_name='Название'),
        ),
    ]
