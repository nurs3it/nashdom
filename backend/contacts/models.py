from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ContactRequest(models.Model):
    """Заявка на обратную связь"""
    
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'В обработке'),
        ('completed', 'Завершена'),
        ('cancelled', 'Отменена'),
    ]
    
    REQUEST_TYPE_CHOICES = [
        ('general', 'Общий вопрос'),
        ('property_inquiry', 'Запрос по объекту'),
        ('viewing', 'Запрос на просмотр'),
        ('callback', 'Обратный звонок'),
    ]
    
    # Основная информация
    name = models.CharField(max_length=100, verbose_name='Имя')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    
    # Тип и содержание запроса
    request_type = models.CharField(
        max_length=20,
        choices=REQUEST_TYPE_CHOICES,
        default='general',
        verbose_name='Тип запроса'
    )
    subject = models.CharField(max_length=200, verbose_name='Тема')
    message = models.TextField(verbose_name='Сообщение')
    
    # Связанный объект (если запрос по конкретному объекту)
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='contact_requests',
        verbose_name='Объект недвижимости'
    )
    
    # Пользователь (если авторизован)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='contact_requests',
        verbose_name='Пользователь'
    )
    
    # Статус и обработка
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='new',
        verbose_name='Статус'
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='assigned_requests',
        verbose_name='Назначен'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    processed_at = models.DateTimeField(
        blank=True, 
        null=True, 
        verbose_name='Дата обработки'
    )
    
    class Meta:
        verbose_name = 'Заявка на связь'
        verbose_name_plural = 'Заявки на связь'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.subject} ({self.get_status_display()})"


class Newsletter(models.Model):
    """Подписка на рассылку"""
    email = models.EmailField(unique=True, verbose_name='Email')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата подписки')
    
    class Meta:
        verbose_name = 'Подписка на рассылку'
        verbose_name_plural = 'Подписки на рассылку'
        
    def __str__(self):
        return self.email