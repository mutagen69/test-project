"""test_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include, re_path
from django.conf.urls.static import static
from customusers.views import favorites
from filebrowser.sites import site
from django.contrib import admin
from django.conf import settings
from .views import index

urlpatterns = [
    path('', index, name='main'),
    re_path('^(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$', index, name='main_password_reset'),
    path('admin/filebrowser/', site.urls),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('tinymce/', include('tinymce.urls')),
    path('grappelli/', include('grappelli.urls')),
    path('favorites/', favorites, name='favorites'),
    path('api-auth/', include('rest_framework.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('articles/', include('articles.urls', namespace='articles')),
    path('authors/', include('customusers.urls', namespace='customusers')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
