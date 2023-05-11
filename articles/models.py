import re
from django.db import models
from tinymce.models import HTMLField
from customusers.models import CustomUser
from mptt.models import MPTTModel, TreeForeignKey
from django.core.exceptions import ValidationError
from django.template.defaultfilters import slugify


def unique_slugify(instance, value, slug_field_name='slug', queryset=None,
                   slug_separator='-'):
    slug_field = instance._meta.get_field(slug_field_name)

    slug = getattr(instance, slug_field.attname)
    slug_len = slug_field.max_length

    slug = slugify(value)
    if slug_len:
        slug = slug[:slug_len]
    slug = _slug_strip(slug, slug_separator)
    original_slug = slug

    if queryset is None:
        queryset = instance.__class__._default_manager.all()
    if instance.pk:
        queryset = queryset.exclude(pk=instance.pk)

    next = 2
    while not slug or queryset.filter(**{slug_field_name: slug}):
        slug = original_slug
        end = '%s%s' % (slug_separator, next)
        if slug_len and len(slug) + len(end) > slug_len:
            slug = slug[:slug_len-len(end)]
            slug = _slug_strip(slug, slug_separator)
        slug = '%s%s' % (slug, end)
        next += 1

    setattr(instance, slug_field.attname, slug)


def _slug_strip(value, separator='-'):
    separator = separator or ''
    if separator == '-' or not separator:
        re_sep = '-'
    else:
        re_sep = '(?:-|%s)' % re.escape(separator)
    if separator != re_sep:
        value = re.sub('%s+' % re_sep, separator, value)
    if separator:
        if separator != '-':
            re_sep = re.escape(separator)
        value = re.sub(r'^%s+|%s+$' % (re_sep, re_sep), '', value)
    return value


class Article(models.Model):
    title = models.CharField(max_length=100, verbose_name='Название')
    slug = models.SlugField(auto_created=True, max_length=100, unique=True, verbose_name='Слаг')
    short_content = models.CharField(max_length=100, verbose_name='Краткое описание')
    content = HTMLField(verbose_name='Текст')
    views = models.ManyToManyField('Ip', related_name="post_views", blank=True, default=None)
    preview = models.ImageField(upload_to='articles_images/', verbose_name='Превью')
    published = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='articles',
                               null=True, blank=True, editable=False, default=None)
    tags = models.ManyToManyField('Tag', related_name='articles',
                                   blank=True, default=None, verbose_name='Теги')
    category = TreeForeignKey('Category', on_delete=models.PROTECT, related_name='articles', verbose_name='Категория')

    @property
    def reading_time(self):
        content = re.sub(re.compile('<.*?>'), '', self.content)
        return round(len(str(content)) / 1000)

    @property
    def views_count(self):
        return self.views.count()

    @property
    def comments_count(self):
        return self.comments.count()

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'
        ordering = ('-published', )

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        if self.category.kids.count() > 0:
            raise ValidationError(
                'Category invalid',
                'invalid'
            )

        unique_slugify(self, self.title)

        super().save(force_insert, force_update, *args, **kwargs)


class Tag(models.Model):
    title = models.CharField(max_length=50)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Тег'
        verbose_name_plural = 'Теги'
        ordering = ('title', )


class Category(MPTTModel):
    title = models.CharField(max_length=50)
    parent = TreeForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='kids',
                            db_index=True, verbose_name='Родительская категория')
    slug = models.SlugField(auto_created=True, max_length=100, unique=True, verbose_name='Слаг')

    def __str__(self):
        return self.title

    class MPTTMeta:
        order_insertion_by = ['id']

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ('id', )


class Ip(models.Model):
    ip = models.CharField(max_length=50, default=None, blank=True, null=True)

    def __str__(self):
        return self.ip


class Comment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField()
    published = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ('-published',)

    def __str__(self):
        return self.text[:10]
