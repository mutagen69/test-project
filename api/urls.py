from django.urls import path
from api import views

urlpatterns = [
    path('tags/', views.GetTags.as_view()),
    path('auth/login/', views.Login.as_view()),
    path('auth/registration/', views.Registration.as_view()),
    path(
        'auth/registration-activate/<uidb64>/<token>/',
        views.registration_activate,
        name='registration_activate'
    ),
    path('auth/check-email/', views.CheckEmail.as_view()),
    path('auth/password-validate/', views.PasswordValidate.as_view()),
    path('articles/', views.GetArticles.as_view()),
    path('comments/', views.CreateComment.as_view()),
    path('authors/', views.GetCustomUsers.as_view()),
    path('categories/', views.GetCategories.as_view()),
    path('favorites/', views.CreateFavorite.as_view()),
    path('favorites/<int:pk>/', views.DeleteFavorite.as_view()),
    path('become_author/', views.CreateAuthorRequest.as_view()),
    path('auth/set-password/', views.SetPasswrod.as_view())
]
