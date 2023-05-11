# Generated by Django 4.1.7 on 2023-03-22 11:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0022_ip_remove_article_views_article_views'),
        ('customusers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='favorites',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.PROTECT, to='articles.article'),
        ),
    ]