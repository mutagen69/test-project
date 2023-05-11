from articles.serializers import ArticleSerializer, CategorySerializer, TagSerializer, CommentSerializer
from customusers.serializers import CustomUserSerializer, FavoriteSerializer, AuthorRequestSerializer
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from test_project.forms import RegistrationForm, ResetPasswordForm, SetNewPasswordForm
from customusers.models import CustomUser, Favorite, AuthorRequest
from articles.models import Article, Category, Ip, Tag, Comment
from django.contrib.auth.tokens import default_token_generator
from rest_framework.authentication import SessionAuthentication
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.forms import AuthenticationForm
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.auth import login, authenticate
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.core.mail import EmailMessage
from rest_framework.views import APIView
from datetime import datetime, timedelta
from django.db.models import Q, Count
from django.shortcuts import redirect
from django.http import HttpResponse


class GetArticles(APIView):

    def get(self, request):
        quantity = request.GET.get('q', None)
        category = request.GET.get('category', '')
        startwith = request.GET.get('startwith', 0)
        sorted_articles = request.GET.get('sorted', 'relevance')
        tags = request.GET.get('tags', '')
        date = request.GET.get('date', '02.01.0001-31.12.9999').split('-')
        date_start = datetime.strptime(date[0], '%d.%m.%Y').date() - timedelta(days=1)
        date_end = datetime.strptime(date[1], '%d.%m.%Y').date()
        reading_time = request.GET.get('reading_time', 0)
        author = request.GET.get('author', 0)
        search = request.GET.get('search', '')
        favorite = request.GET.get('favorite', 0)

        if favorite == 0:
            articles_q = Article.objects.filter(published__range=(date_start, date_end)) \
                                        .filter(Q(title__contains=search) | Q(short_content__contains=search)) \
                                        .prefetch_related('tags', 'views', 'author', 'category', 'comments')
        else:
            if request.user.pk != 0:
                user = CustomUser.objects.get(id=request.user.pk)
                articles_ids = [article['article'] for article in Favorite.objects.filter(author=user).values('article')]
                articles_q = Article.objects.filter(published__range=(date_start, date_end)) \
                                            .filter(Q(title__contains=search) | Q(short_content__contains=search)) \
                                            .filter(id__in=articles_ids) \
                                            .prefetch_related('tags', 'views', 'author', 'category', 'comments')
            else:
                return Response([], status=400)

        if int(author) != 0:
            author = CustomUser.objects.get(pk=author)
            articles_q = articles_q.filter(author=author)

        if category:
            queryset = Category.objects.get(title=category)
            categories = [queryset]
            for cat in queryset.kids.all():
                categories.append(cat)
            articles_q = articles_q.filter(category__in=categories)

        if tags:
            tags = tags.split(';')
            tags = tags[:-1]
            tags = Tag.objects.filter(title__in=tags)

            articles_q = articles_q.filter(tags__in=tags).distinct()

        if sorted_articles == 'views':
            articles_q = articles_q.annotate(v_count=Count('views')) \
                                   .order_by('-v_count')
        elif sorted_articles == 'comments':
            articles_q = articles_q.annotate(c_count=Count('comments')) \
                                   .order_by('-c_count')
        else:
            articles_q = articles_q.order_by('-published')

        if int(reading_time) == 1:
            articles_q = [article for article in articles_q if article.reading_time < 5]
        elif int(reading_time) == 2:
            articles_q = [article for article in articles_q if 5 <= article.reading_time < 10]
        elif int(reading_time) == 3:
            articles_q = [article for article in articles_q if 10 <= article.reading_time < 15]
        elif int(reading_time) == 4:
            articles_q = [article for article in articles_q if article.reading_time >= 15]

        articles_q = articles_q[int(startwith):]

        last = True
        if quantity and len(articles_q) > int(quantity):
            articles_q = articles_q[:int(quantity)]
            last = False

        serializer_for_queryset = ArticleSerializer(
            instance=articles_q,
            many=True,
            context={
                'last': last
            }
        )

        return Response(serializer_for_queryset.data)


class GetCategories(APIView):

    def get(self, request):
        quantity = request.GET.get('q', None)
        startwith = request.GET.get('startwith', 0)
        selected = request.GET.get('selected', '')

        categories = list()
        if selected != '' and int(startwith) == 0:
            category = Category.objects.get(title=selected)
            if category.parent is None:
                categories.append(category)
            else:
                categories.append(category.parent)
            categories = categories + [category for category in Category.objects.order_by('pk') \
                                                                                .filter(parent=None) \
                                                                                .filter(~Q(title=categories[-1].title)) \
                                                                                .prefetch_related('kids')]
        elif selected != '':
            category = Category.objects.get(title=selected)
            if category.parent is None:
                categories.append(category)
            else:
                categories.append(category.parent)
            categories = categories + [category for category in Category.objects.order_by('pk') \
                                                                                .filter(parent=None) \
                                                                                .filter(~Q(title=categories[-1].title)) \
                                                                                .prefetch_related('kids')]
        else:
            categories = Category.objects.filter(parent=None) \
                                         .order_by('pk') \
                                         .prefetch_related('kids')

        categories = categories[int(startwith):]

        last = True
        if quantity and len(categories) > int(quantity):
            categories = categories[:int(quantity)]
            last = False

        serializer_for_queryset = CategorySerializer(
            instance=categories,
            many=True,
            context={
                'last': last
            }
        )

        return Response(serializer_for_queryset.data)


class GetTags(APIView):

    def get(self, request):
        quantity = request.GET.get('q', None)
        startwith = request.GET.get('startwith', 0)
        start_tag = request.GET.get('selected', '')

        tags = list()
        if start_tag != '' and int(startwith) == 0:
            tags.append(Tag.objects.get(title=start_tag))
            tags = tags + [tag for tag in Tag.objects.order_by('pk') \
                                                     .filter(~Q(title=start_tag))]
        elif start_tag != '':
            tags = tags + [tag for tag in Tag.objects.order_by('pk') \
                                                     .filter(~Q(title=start_tag))]
        else:
            tags = Tag.objects.order_by('pk')

        tags = tags[int(startwith):]

        last = True
        if quantity and len(tags) > int(quantity):
            tags = tags[:int(quantity)]
            last = False

        serializer_for_queryset = TagSerializer(
            instance=tags,
            many=True,
            context={
                'last': last
            }
        )

        return Response(serializer_for_queryset.data)


class CreateComment(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class GetCustomUsers(APIView):

    def get(self, request):
        q = request.GET.get('q', '')
        quantity = request.GET.get('quantity', 0)
        startwith = request.GET.get('startwith', 0)
        category = request.GET.get('category', '')
        tags = request.GET.get('tags', '')

        queryset = CustomUser.objects.filter(author=True) \
                                     .order_by('pk')

        if category != '':
            categories = [category]

            cats = Category.objects.get(title=category)
            for cat in cats.kids.all():
                categories.append(cat.title)

            users = []
            for user in queryset:
                for category in user.categories:
                    if category in categories:
                        users.append(user)
                        break

            queryset = users

        if tags != '':
            tags = tags.split(';')[:-1]
            users = []

            for user in queryset:
                for tag in user.tags:
                    if tag in tags:
                        users.append(user)
                        break

            queryset = users

        users = []
        for user in queryset:
            if q.title() in user.full_name:
                users.append(user)

        users = users[int(startwith):]

        last = True
        if quantity != 0 and len(users) > int(quantity):
            users = users[:int(quantity)]
            last = False

        serializer_for_queryset = CustomUserSerializer(
            instance=users,
            many=True,
            context={
                'last': last
            }
        )

        return Response(serializer_for_queryset.data)


class CreateFavorite(generics.ListCreateAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = (SessionAuthentication, )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class DeleteFavorite(generics.DestroyAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = (SessionAuthentication,)


class CreateAuthorRequest(generics.ListCreateAPIView):
    queryset = AuthorRequest.objects.all()
    serializer_class = AuthorRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = (SessionAuthentication, )

    def create(self, request, *args, **kwargs):
        email = self.request.POST.get('author-email', None)
        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'Email введен с ошибкой'}, status=400)

        if email is not None:
            if AuthorRequest.objects.filter(email=email).exists():
                return Response({'error': 'Заявка уже на рассмотрении'}, status=400)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(email=self.request.POST.get('author-email', None))


class Login(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            auth_form = AuthenticationForm(data=request.POST)
            if auth_form.is_valid():
                user = authenticate(
                    username=auth_form.cleaned_data.get('username'),
                    password=auth_form.cleaned_data.get('password')
                )
                if user is not None:
                    login(request, user)
                    return Response({'auth': True}, status=200)
                else:
                    return Response({'error': 'Email or password error'}, status=400)
            else:
                return Response({'error': 'Email or password error'}, status=400)
        else:
            return Response({'error': 'Bad request'}, status=400)


class Registration(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            reg_form = RegistrationForm(request.POST)
            if reg_form.is_valid():
                user = CustomUser.objects.create_user(
                    email=reg_form.cleaned_data.get('email'),
                    first_name=reg_form.cleaned_data.get('first_name'),
                    last_name=reg_form.cleaned_data.get('last_name'),
                    password=reg_form.cleaned_data.get('password1'),
                    author=False,
                    is_active=False
                )
                user.save()

                current_site = get_current_site(request)
                mail_subject = 'Подтверждение регистрации'
                message = render_to_string('registration/registration_email.html', {
                    'domain': current_site.domain,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': default_token_generator.make_token(user),
                })
                to_email = reg_form.cleaned_data.get('email')
                email = EmailMessage(
                    mail_subject, message, to=[to_email]
                )
                email.send()

                return Response({'registration': True}, status=200)
            else:
                return Response(reg_form.errors.as_json(), status=400)
        else:
            return Response({'error': 'Bad request'}, status=400)


def registration_activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return redirect('/?register=success')
    else:
        return HttpResponse('Activation link is invalid!')


class CheckEmail(APIView):
    def post(self, request):
        email = request.POST.get('email', False)
        if email:
            try:
                validate_email(email)
            except ValidationError:
                return Response({'email': [{'message': 'Email введён неправильно'}]}, status=400)
            user = CustomUser.objects.filter(email=email)
            if user.exists():
                user = user[0]
                current_site = get_current_site(request)

                mail_subject = 'Восстановление пароля'
                message = render_to_string('registration/password_reset_email.html', {
                    'domain': current_site.domain,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': default_token_generator.make_token(user),
                })
                to_email = email
                email = EmailMessage(
                    mail_subject, message, to=[to_email]
                )
                email.send()
                return Response({'email': True}, status=200)
            else:
                return Response({'email': [{'message': 'Пользователь с таким Email не найден'}]}, status=400)


class PasswordValidate(APIView):
    def post(self, request):
        uidb64 = request.POST.get('uidb64')
        token = request.POST.get('token')
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response(['authorize_error'], status=503)
        if user is not None and default_token_generator.check_token(user, token):
            pass
        else:
            return Response(['authorize_error'], status=503)

        form = ResetPasswordForm(user=user, data=request.POST)
        if form.is_valid():
            user.set_password(form.cleaned_data['new_password1'])
            user.save()
            return Response({'password': True}, status=200)
        return Response(form.errors.as_json(), status=400)


class SetPasswrod(APIView):
    def post(self, request):
        form = SetNewPasswordForm(user=request.user, data=request.POST)
        if form.is_valid():
            request.user.set_password(form.cleaned_data['new_password1'])
            request.user.save()
            return Response({'password': True}, status=200)
        return Response(form.errors.as_json(), status=400)
