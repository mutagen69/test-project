from .models import CustomUser, Favorite, AuthorRequest
from rest_framework import serializers
from articles.models import Article
from django.urls import reverse


class CustomUserSerializer(serializers.ModelSerializer):
    fio = serializers.CharField(source='full_name')
    views = serializers.IntegerField(source='views_count')
    avatar = serializers.CharField(source='avatar.url')
    url = serializers.SerializerMethodField('_url')
    categories = serializers.ListField()
    tags = serializers.ListField()
    last_objects = serializers.SerializerMethodField('_is_last_objects')

    def _url(self, obj):
        return reverse('customusers:author_by_id', kwargs={'author_id': obj.id})

    def _is_last_objects(self, obj):
        return self.context.get('last', False)

    class Meta:
        model = CustomUser
        fields = ('id', 'fio', 'views', 'avatar', 'url', 'categories', 'tags', 'last_objects')


class FavoriteSerializer(serializers.ModelSerializer):
    article = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all())
    author = serializers.ReadOnlyField(source='author.id')

    class Meta:
        model = Favorite
        fields = ('id', 'author', 'article')


class AuthorRequestSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField()

    class Meta:
        model = AuthorRequest
        fields = '__all__'
