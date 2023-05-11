from .views import index, article_by_id, article_by_slug, delete_article, create_article, edit_article
from django.urls import path

app_name = 'articles'
urlpatterns = [
    path('', index, name='articles'),
    path('create/', create_article, name='create_article'),
    path('edit/<int:article_id>/', edit_article, name='edit_article'),
    path('<int:article_id>/', article_by_id, name='article_by_id'),
    path('<slug:article_slug>/', article_by_slug, name='article_by_slug'),
    path('<int:article_id>/delete/', delete_article, name='article_delete'),
]
