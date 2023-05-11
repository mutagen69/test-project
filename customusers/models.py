from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(
                'Superuser must have is_staff=True.'
            )
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(
                'Superuser must have is_superuser=True.'
            )

        return self._create_user(email, password, **extra_fields)


class CustomUser(AbstractUser, PermissionsMixin):
    username = None
    email = models.EmailField(unique=True, verbose_name='Email')
    first_name = models.CharField(max_length=30, verbose_name='Имя')
    last_name = models.CharField(max_length=30, verbose_name='Фамилия')
    about = models.TextField(max_length=3000, verbose_name='Об авторе', default='', blank=True)
    author = models.BooleanField(default=False, verbose_name='Автор')
    avatar = models.ImageField(upload_to='avatars/', verbose_name='Аватар', default='avatars/default.jpg')

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = [
        'first_name',
        'last_name',
        'author'
    ]

    objects = CustomUserManager()

    @property
    def views_count(self):
        views = 0
        for article in self.articles.all():
            views += article.views_count
        return views

    @property
    def categories(self):
        articles = self.articles.filter(author=self.id).prefetch_related('category')
        categories = [article.category.title for article in articles]
        return set(categories)

    @property
    def tags(self):
        tags = []
        articles = self.articles.filter(author=self.id).prefetch_related('tags')
        for article in articles:
            tags += [tag[0] for tag in article.tags.values_list('title')]
        return set(tags)

    @property
    def fio(self):
        return f'{str(self.first_name[:1]).title()}. {str(self.last_name).title()}'

    @property
    def full_name(self):
        return f'{str(self.first_name).title()} {str(self.last_name).title()}'

    def get_short_name(self):
        return self.first_name

    def natural_key(self):
        return self.email

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'


class Favorite(models.Model):
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='favorites')
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='favorites')

    class Meta:
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранные'
        ordering = ['-id']
        constraints = [
            models.UniqueConstraint(
                fields=['author', 'article'],
                name='unique_author_article'
            )
        ]


class AuthorRequest(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(unique=True)
    status = models.BooleanField(
        choices=(
            (None, 'На рассмотрении'),
            (True, 'Подтверждено'),
            (False, 'Отклонено')
        ), default=None, null=True
    )

    class Meta:
        verbose_name = 'Заявка на авторство'
        verbose_name_plural = 'Заявки на авторство'
        ordering = ['-id']
