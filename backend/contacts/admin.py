from django.contrib import admin
from django.utils.html import format_html
from .models import ContactRequest, Newsletter


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    """Админка для заявок на связь"""
    list_display = ('name', 'email', 'phone', 'request_type', 'status', 'property', 'assigned_to', 'created_at')
    list_filter = ('request_type', 'status', 'created_at', 'assigned_to')
    search_fields = ('name', 'email', 'phone', 'subject', 'message')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('status', 'assigned_to')
    
    fieldsets = (
        ('Контактная информация', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Содержание запроса', {
            'fields': ('request_type', 'subject', 'message', 'property')
        }),
        ('Обработка', {
            'fields': ('status', 'assigned_to', 'processed_at')
        }),
        ('Связанные данные', {
            'fields': ('user',),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('property', 'user', 'assigned_to')
    
    actions = ['mark_in_progress', 'mark_completed']
    
    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
        self.message_user(request, f"Статус {queryset.count()} заявок изменен на 'В обработке'")
    mark_in_progress.short_description = "Отметить как 'В обработке'"
    
    def mark_completed(self, request, queryset):
        queryset.update(status='completed')
        self.message_user(request, f"Статус {queryset.count()} заявок изменен на 'Завершена'")
    mark_completed.short_description = "Отметить как 'Завершена'"


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    """Админка для подписок на рассылку"""
    list_display = ('email', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('email',)
    list_editable = ('is_active',)
    
    actions = ['activate_subscriptions', 'deactivate_subscriptions']
    
    def activate_subscriptions(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} подписок активировано")
    activate_subscriptions.short_description = "Активировать подписки"
    
    def deactivate_subscriptions(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} подписок деактивировано")
    deactivate_subscriptions.short_description = "Деактивировать подписки"