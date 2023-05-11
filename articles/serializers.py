from rest_framework import serializers
from django.urls import reverse
from .models import Article, Category, Tag, Comment


class CommentSerializer(serializers.ModelSerializer):
    article = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all())
    author = serializers.ReadOnlyField(source='author.id')
    text = serializers.CharField()

    def to_representation(self, instance):
        data = super().to_representation(instance).copy()
        data.update({
            "author_url": reverse('customusers:author_by_id', kwargs={'author_id': instance.author.id}),
            "author_avatar": instance.author.avatar.url,
            "author_fio": instance.author.fio
        })
        return data

    class Meta:
        model = Comment
        fields = ('id', 'article', 'author', 'text', 'published')


class TagSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=50)

    last_objects = serializers.SerializerMethodField('_is_last_objects')

    def _is_last_objects(self, obj):
        return self.context.get('last', False)

    class Meta:
        model = Tag
        fields = ('id', 'title', 'last_objects')


class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=100)
    kids = serializers.StringRelatedField(many=True)

    category_url = serializers.SerializerMethodField('_category_url')

    def _category_url(self, obj):
        return reverse('articles:articles') + "?category=" + obj.title

    last_objects = serializers.SerializerMethodField('_is_last_objects')

    def _is_last_objects(self, obj):
        return self.context.get('last', False)

    class Meta:
        model = Category
        fields = ('id', 'title', 'kids', 'category_url')


class ArticleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=100)
    slug = serializers.SlugField()
    short_content = serializers.CharField(max_length=100)
    published = serializers.DateTimeField()
    reading_time = serializers.IntegerField()
    image_url = serializers.CharField(source='preview.url')
    tags = serializers.StringRelatedField(many=True)

    category_title = serializers.CharField(source='category.title')

    author_first_name = serializers.CharField(source='author.first_name', max_length=50)
    author_last_name = serializers.CharField(source='author.last_name', max_length=50)
    author_avatar_url = serializers.CharField(source='author.avatar.url')
    author_id = serializers.IntegerField(source='author.pk')

    author_url = serializers.SerializerMethodField('_author_url')

    def _author_url(self, obj):
        return reverse('customusers:author_by_id', kwargs={'author_id': obj.author.id})

    last_objects = serializers.SerializerMethodField('_is_last_objects')

    def _is_last_objects(self, obj):
        return self.context.get('last', False)

    article_url = serializers.SerializerMethodField('_article_url')

    def _article_url(self, obj):
        return reverse('articles:article_by_slug', kwargs={'article_slug': obj.slug})

    class Meta:
        model = Article
        fields = ('title', 'slug', 'short_content', 'published', 'reading_time', 'image_url', 'tags', 'category_title',
                  'author_first_name', 'author_last_name', 'author_id', 'last_objects', 'article_url')
