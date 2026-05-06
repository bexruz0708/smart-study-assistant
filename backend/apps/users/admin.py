from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email',
        'first_name',
        'last_name',
        'is_active',
        'is_staff',
        'is_verified',
        'date_joined',
    )

    #filter
    list_filter = ('is_active', 'is_staff', 'is_verified', 'date_joined')

    #search
    search_fields = ('email', 'first_name', 'last_login')

    #query
    ordering = ('-date_joined',)

    #only read fieldareas
    readonly_fields = ('date_joined', 'last_login')

    #user fieldareas
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'avatar')}),
        (_('Permissions'),{
            'fields': ('is_active', 'is_verified', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    #add new users fieldareas
    add_fieldsets =(
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name',),
        }),
    )
# Register your models here.
