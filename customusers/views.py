from .models import CustomUser
from django.shortcuts import render, get_object_or_404


def index(request):
    return render(request, 'customusers/authors.html')


def author_by_id(request, author_id: int):
    author = get_object_or_404(CustomUser, pk=int(author_id), author=True)
    return render(request, 'customusers/author.html', {'author': author})


def favorites(request):
    return render(request, 'customusers/favorites.html')
