from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('login_id', 'full_name', 'user_type', 'is_active')
