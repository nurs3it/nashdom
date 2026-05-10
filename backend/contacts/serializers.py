from rest_framework import serializers
from .models import ContactRequest, Newsletter
from properties.serializers import PropertyListSerializer


class ContactRequestSerializer(serializers.ModelSerializer):
    """Сериализатор для заявок на связь"""
    property_details = PropertyListSerializer(source='property', read_only=True)
    
    class Meta:
        model = ContactRequest
        fields = ('id', 'name', 'email', 'phone', 'request_type', 'subject',
                 'message', 'property', 'property_details', 'status', 
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Если пользователь авторизован, привязываем заявку к нему
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        return super().create(validated_data)


class ContactRequestUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления заявок (только для админов)"""
    
    class Meta:
        model = ContactRequest
        fields = ('status', 'assigned_to', 'processed_at')


class NewsletterSerializer(serializers.ModelSerializer):
    """Сериализатор для подписки на рассылку"""
    
    class Meta:
        model = Newsletter
        fields = ('id', 'email', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class ContactStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики заявок"""
    total_requests = serializers.IntegerField()
    new_requests = serializers.IntegerField()
    in_progress_requests = serializers.IntegerField()
    completed_requests = serializers.IntegerField()
    requests_by_type = serializers.DictField()
    recent_requests = ContactRequestSerializer(many=True)
