# Generated by Django 4.1.7 on 2023-03-25 11:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0022_ip_remove_article_views_article_views'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='article',
            options={'ordering': ('-published',), 'verbose_name': 'Статья', 'verbose_name_plural': 'Статьи'},
        ),
    ]
