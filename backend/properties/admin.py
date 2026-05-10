from django.contrib import admin
from django.utils.html import format_html
from .models import PropertyType, ServiceType, Property, PropertyImage, Favorite


@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    """Админка для типов недвижимости"""
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    """Админка для видов услуг"""
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


class PropertyImageInline(admin.TabularInline):
    """Inline для изображений объекта"""
    model = PropertyImage
    extra = 1
    fields = ('image', 'alt_text', 'is_main', 'order')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    """Админка для объектов недвижимости"""
    list_display = ('title', 'price', 'property_type', 'service_type', 'city', 'status', 'is_featured', 'views_count', 'created_at')
    list_filter = ('property_type', 'service_type', 'status', 'is_featured', 'city', 'has_parking', 'has_balcony', 'has_elevator', 'created_at')
    search_fields = ('title', 'description', 'city', 'district', 'address')
    readonly_fields = ('views_count', 'created_at', 'updated_at')
    list_editable = ('status', 'is_featured')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'price', 'property_type', 'service_type')
        }),
        ('Местоположение', {
            'fields': ('city', 'district', 'address', 'latitude', 'longitude')
        }),
        ('Характеристики', {
            'fields': ('area', 'rooms', 'floor', 'total_floors')
        }),
        ('Дополнительные удобства', {
            'fields': ('has_parking', 'has_balcony', 'has_elevator'),
            'classes': ('collapse',)
        }),
        ('Статус и настройки', {
            'fields': ('status', 'is_featured', 'owner')
        }),
        ('Метаданные', {
            'fields': ('views_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [PropertyImageInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('property_type', 'service_type', 'owner')


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    """Админка для изображений объектов"""
    list_display = ('property', 'image_preview', 'alt_text', 'is_main', 'order', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('property__title', 'alt_text')
    list_editable = ('is_main', 'order')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return 'Нет изображения'
    image_preview.short_description = 'Превью'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    """Админка для избранного"""
    list_display = ('user', 'property', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'property__title')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'property')