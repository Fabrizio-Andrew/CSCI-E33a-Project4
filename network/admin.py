from django.contrib import admin
from .models import User, Post

# Register your models here.

class PostAdmin(admin.ModelAdmin):
    readonly_fields = ('timestamp',)

admin.site.register(User)
admin.site.register(Post, PostAdmin)