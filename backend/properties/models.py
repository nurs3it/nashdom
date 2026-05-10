from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class PropertyType(models.Model):
    """Тип недвижимости"""
    name = models.CharField(max_length=100, unique=True, verbose_name='Название')
    slug = models.SlugField(unique=True, verbose_name='Слаг')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Тип недвижимости'
        verbose_name_plural = 'Типы недвижимости'
        
    def __str__(self):
        return self.name


class ServiceType(models.Model):
    """Вид услуги (продажа/аренда)"""
    name = models.CharField(max_length=50, unique=True, verbose_name='Название')
    slug = models.SlugField(unique=True, verbose_name='Слаг')
    
    class Meta:
        verbose_name = 'Вид услуги'
        verbose_name_plural = 'Виды услуг'
        
    def __str__(self):
        return self.name


class Property(models.Model):
    """Объект недвижимости"""
    
    STATUS_CHOICES = [
        ('active', 'Активный'),
        ('sold', 'Продан'),
        ('rented', 'Сдан'),
        ('inactive', 'Неактивный'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    description = models.TextField(verbose_name='Описание')
    price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        verbose_name='Цена'
    )
    
    # Тип и услуга
    property_type = models.ForeignKey(
        PropertyType, 
        on_delete=models.CASCADE,
        verbose_name='Тип недвижимости'
    )
    service_type = models.ForeignKey(
        ServiceType, 
        on_delete=models.CASCADE,
        verbose_name='Вид услуги'
    )
    
    # Местоположение
    city = models.CharField(max_length=100, verbose_name='Город')
    district = models.CharField(max_length=100, blank=True, verbose_name='Район')
    address = models.CharField(max_length=255, verbose_name='Адрес')
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        verbose_name='Широта',
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        verbose_name='Долгота',
    )
    
    # Характеристики
    area = models.FloatField(
        validators=[MinValueValidator(0.1)],
        verbose_name='Площадь (м²)'
    )
    rooms = models.PositiveIntegerField(
        blank=True, 
        null=True,
        verbose_name='Количество комнат'
    )
    floor = models.PositiveIntegerField(
        blank=True, 
        null=True,
        verbose_name='Этаж'
    )
    total_floors = models.PositiveIntegerField(
        blank=True, 
        null=True,
        verbose_name='Всего этажей'
    )
    
    # Дополнительные характеристики
    has_parking = models.BooleanField(default=False, verbose_name='Парковка')
    has_balcony = models.BooleanField(default=False, verbose_name='Балкон')
    has_elevator = models.BooleanField(default=False, verbose_name='Лифт')
    
    # Статус и даты
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='active',
        verbose_name='Статус'
    )
    is_featured = models.BooleanField(default=False, verbose_name='Рекомендуемое')
    
    # Связи
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='properties',
        verbose_name='Владелец'
    )
    
    # Главное изображение
    main_image = models.ImageField(
        upload_to='properties/', 
        blank=True, 
        null=True,
        verbose_name='Главное изображение'
    )
    
    # Метаданные
    views_count = models.PositiveIntegerField(default=0, verbose_name='Просмотры')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Объект недвижимости'
        verbose_name_plural = 'Объекты недвижимости'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.price}"
    
    def increment_views(self):
        """Увеличить счетчик просмотров"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class PropertyImage(models.Model):
    """Изображения объекта недвижимости"""
    property = models.ForeignKey(
        Property, 
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='Объект'
    )
    image = models.ImageField(
        upload_to='properties/', 
        verbose_name='Изображение'
    )
    alt_text = models.CharField(
        max_length=255, 
        blank=True,
        verbose_name='Альтернативный текст'
    )
    is_main = models.BooleanField(default=False, verbose_name='Главное изображение')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Изображение объекта'
        verbose_name_plural = 'Изображения объектов'
        ordering = ['order', 'created_at']
        
    def __str__(self):
        return f"Изображение для {self.property.title}"


class Favorite(models.Model):
    """Избранные объекты пользователя"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='Пользователь'
    )
    property = models.ForeignKey(
        Property, 
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name='Объект'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')
    
    class Meta:
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранные'
        unique_together = ['user', 'property']
        
    def __str__(self):
        return f"{self.user.email} - {self.property.title}"