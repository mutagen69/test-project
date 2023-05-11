from django.contrib import admin
from .models import Article, Tag, Category, Ip, Comment
from mptt.admin import MPTTModelAdmin


class ArticlesAdmin(admin.ModelAdmin):
    list_display = ('title', 'published', 'author', 'views_count')
    verbose_name = 'Статья'
    verbose_name_plural = 'Статьи'
    prepopulated_fields = {"slug": ("title",)}

    def get_readonly_fields(self, request, obj=None):
        if obj:
            self.prepopulated_fields = {}
            return self.readonly_fields + ('slug',)
        return self.readonly_fields


class CategoryAdmin(MPTTModelAdmin):
    prepopulated_fields = {"slug": ("title",)}

    def get_readonly_fields(self, request, obj=None):
        if obj:
            self.prepopulated_fields = {}
            return self.readonly_fields + ('slug',)
        return self.readonly_fields


admin.site.register(Article, ArticlesAdmin)
admin.site.register(Tag)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Ip)
admin.site.register(Comment)
