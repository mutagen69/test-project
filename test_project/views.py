from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from articles.models import Article, Category
from datetime import datetime, timedelta
from django.shortcuts import render, redirect
from customusers.models import CustomUser
from django.contrib.auth.tokens import default_token_generator
from .forms import ResetPasswordForm


def index(request, uidb64=False, token=False):
    if uidb64 and token:
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return redirect('/')
        if user is not None and default_token_generator.check_token(user, token):
            password_reset = ResetPasswordForm(user=user, initial={'uidb64': uidb64, 'token': token})
        else:
            return redirect('/')
    else:
        password_reset = False

    end_date = datetime.today()
    start_date = end_date - timedelta(days=99)  # TODO сменить на 7 дней

    top_tags = {}
    top_articles = {}

    last_articles = Article.objects.filter(published__range=(start_date, end_date)).prefetch_related('tags', 'views')
    for article in last_articles:
        top_articles[article] = article.views_count
        for tag in article.tags.all():
            if tag not in top_tags:
                top_tags[tag] = 0
            top_tags[tag] += article.views_count

    top_tags = sorted(top_tags.items(), key=lambda x: x[1])
    top_articles = sorted(top_articles.items(), key=lambda x: x[1])

    if len(top_tags) > 20:
        top_tags = top_tags[:20]
    for i, tag in enumerate(top_tags):
        top_tags[i] = tag[0]

    if len(top_articles) > 6:
        top_articles = top_articles[:6]
    for i, article in enumerate(top_articles):
        top_articles[i] = article[0]

    articles = Article.objects.prefetch_related('tags', 'views', 'author', 'category')[:5]

    categories = Category.objects.filter(parent=None).order_by('pk').prefetch_related('kids')[:10]

    context = {
        'title': 'Главная',
        'top_tags': reversed(top_tags),
        'top_articles': reversed(top_articles),
        'articles': articles,
        'categories': categories,
        'password_reset': password_reset
    }
    return render(request, 'pages/main.html', context)
