from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import UserManager

class User (AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        _('email adress'),
        unique=True,
        db_index=True
    )
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last_name'), max_length=150, blank=True)

    #picture profile
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('user active or deactive')

    )
    #conditions
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('is the enter admin panel'),
    )
    is_verified = models.BooleanField(
        _('verified'),
        default=False,
        help_text=_('is the email verified'),
    )

    #Time
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    last_login = models.DateTimeField(_('last login'), blank=True, null=True)

    #Manager(for create user)
    objects = UserManager()

    #login which area enter email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS =[]

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        db_table = 'users'
        ordering =['-date_joined']

    def __str__(self):
        return self.email
    
    def get_full_name(self):
        full_name = f'{self.first_name} {self.last_name}'
        return full_name.strip()
    
    def get_short_time(self):
        return self.first_name
# Create your models here.
