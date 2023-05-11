# Generated by Django 4.1.7 on 2023-03-22 10:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import mptt.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('articles', '0015_alter_article_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='author',
            field=models.ForeignKey(blank=True, default=None, editable=False, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='article',
            name='category',
            field=mptt.fields.TreeForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='articles', to='articles.category', verbose_name='Категория'),
        ),
    ]