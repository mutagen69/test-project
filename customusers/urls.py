from .views import index, author_by_id
from django.urls import path

app_name = 'customusers'
urlpatterns = [
    path('', index, name='authors'),
    path('<int:author_id>/', author_by_id, name='author_by_id'),
]