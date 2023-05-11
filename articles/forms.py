from tinymce.widgets import TinyMCE
from django import forms
from .models import Article
from django.core.exceptions import ValidationError


class ArticleForm(forms.ModelForm):
    content = forms.CharField(widget=TinyMCE(attrs={'cols': 80, 'rows': 10}), label='Текст')

    class Meta:
        model = Article
        fields = ('title', 'short_content', 'content', 'preview', 'tags', 'category', )

    def clean_category(self):
        category = self.cleaned_data.get('category')
        if category.kids.count() > 0:
            raise ValidationError(
                'Нельзя выбирать родительские категории',
                code='invalid'
            )
        return category
