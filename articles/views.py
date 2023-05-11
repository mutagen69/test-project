from django.shortcuts import render, get_object_or_404, redirect
from customusers.models import CustomUser, Favorite
from django.template.defaultfilters import slugify
from .models import Article, Category, Ip
from django.db.models import Q
from .forms import ArticleForm


def index(request):
    return render(request, 'articles/articles.html')


def article_by_id(request, article_id: int):
    article = get_object_or_404(Article, pk=int(article_id))

    categories = [article.category]
    while categories[-1].parent is not None:
        categories.append(Category.objects.get(pk=categories[-1].parent.pk))

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    if Ip.objects.filter(ip=ip).exists():
        article.views.add(Ip.objects.get(ip=ip))
    else:
        Ip.objects.create(ip=ip)
        article.views.add(Ip.objects.get(ip=ip))

    context = {
        'title': article.title,
        'categories': reversed(categories),
        'article': article
    }

    return render(request, 'articles/article.html', context)


def article_by_slug(request, article_slug):
    article = get_object_or_404(Article, slug=article_slug)

    if request.user.is_authenticated:
        is_favorite = Favorite.objects.filter(author=request.user, article=article.pk)
        if is_favorite.exists():
            is_favorite = is_favorite[0].id
        else:
            is_favorite = False
    else:
        is_favorite = False

    categories = [article.category]
    while categories[-1].parent is not None:
        categories.append(Category.objects.get(pk=categories[-1].parent.pk))

    articles = Article.objects.filter(category=article.category) \
                              .filter(~Q(id=article.id))[:5]

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    if Ip.objects.filter(ip=ip).exists():
        article.views.add(Ip.objects.get(ip=ip))
    else:
        Ip.objects.create(ip=ip)
        article.views.add(Ip.objects.get(ip=ip))

    context = {
        'title': article.title,
        'categories': reversed(categories),
        'article': article,
        'articles': articles,
        'is_favorite': is_favorite
    }

    return render(request, 'articles/article.html', context)


def delete_article(request, article_id):
    article = get_object_or_404(Article, id=article_id)
    if request.user.email != article.author.email:
        return redirect('/')
    article.delete()
    return redirect('/?article=delete')


def create_article(request):
    if not request.user.author:
        return redirect('/?article=need')

    if request.method == 'POST':
        form = ArticleForm(data=request.POST, files=request.FILES)
        if form.is_valid():
            user = CustomUser.objects.get(id=request.user.id)
            category = Category.objects.get(title=form.cleaned_data.get('category'))

            title = form.cleaned_data.get('title')
            article = Article(
                slug=slugify(title),
                title=title,
                short_content=form.cleaned_data.get('short_content'),
                content=form.cleaned_data.get('content'),
                preview=form.cleaned_data.get('preview'),
                author=user,
                category=category
            )

            article.save()

            for tag in form.cleaned_data.get('tags'):
                article.tags.add(tag)

            article.save()

            return redirect('/?article=create')
    else:
        form = ArticleForm

    context = {
        'edit': False,
        'form': form
    }

    return render(request, 'articles/edit.html', context)


def edit_article(request, article_id):
    article = get_object_or_404(Article, id=int(article_id))

    if article.author.id != request.user.id:
        return redirect('/')

    if not request.user.author:
        return redirect('/?article=need')

    if request.method == 'POST':
        form = ArticleForm(data=request.POST, files=request.FILES)
        if form.is_valid():
            user = CustomUser.objects.get(id=request.user.id)
            category = Category.objects.get(title=form.cleaned_data.get('category'))

            article.title = form.cleaned_data.get('title')
            article.short_content = form.cleaned_data.get('short_content')
            article.content = form.cleaned_data.get('content')
            article.preview = form.cleaned_data.get('preview')
            article.author = user
            article.category = category

            for tag in form.cleaned_data.get('tags'):
                article.tags.add(tag)

            article.save()

            return redirect('/?article=edit')
    else:
        form = ArticleForm(instance=article)

    context = {
        'edit': True,
        'form': form
    }

    return render(request, 'articles/edit.html', context)