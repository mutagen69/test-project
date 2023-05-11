# Generated by Django 4.1.7 on 2023-03-22 04:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0007_tag_category_article_tags'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='categories',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='articles.category'),
        ),
        migrations.AlterField(
            model_name='article',
            name='tags',
            field=models.ManyToManyField(blank=True, default=None, null=True, related_name='tags', to='articles.tag'),
        ),
    ]
