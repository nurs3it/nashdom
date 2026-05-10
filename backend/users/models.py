from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Расширенная модель пользователя"""
    
    ROLE_CHOICES = [
        ('client', 'Клиент'),
        ('realtor', 'Риелтор'),
        ('superadmin', 'Супер-администратор'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='Email')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    role = models.CharField(
        max_length=15, 
        choices=ROLE_CHOICES, 
        default='client',
        verbose_name='Роль'
    )
    avatar = models.ImageField(
        upload_to='avatars/', 
        blank=True, 
        null=True,
        verbose_name='Аватар'
    )
    is_verified = models.BooleanField(default=False, verbose_name='Верифицирован')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"