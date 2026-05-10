import django_filters
from .models import Property, PropertyType, ServiceType


class PropertyFilter(django_filters.FilterSet):
    """Фильтры для объектов недвижимости"""
    
    # Цена
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    # Площадь
    area_min = django_filters.NumberFilter(field_name='area', lookup_expr='gte')
    area_max = django_filters.NumberFilter(field_name='area', lookup_expr='lte')
    
    # Количество комнат
    rooms_min = django_filters.NumberFilter(field_name='rooms', lookup_expr='gte')
    rooms_max = django_filters.NumberFilter(field_name='rooms', lookup_expr='lte')
    
    # Город (частичное совпадение)
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    
    # Тип недвижимости
    property_type = django_filters.ModelChoiceFilter(
        queryset=PropertyType.objects.all(),
        field_name='property_type'
    )
    
    # Вид услуги
    service_type = django_filters.ModelChoiceFilter(
        queryset=ServiceType.objects.all(),
        field_name='service_type'
    )
    
    # Дополнительные удобства
    has_parking = django_filters.BooleanFilter(field_name='has_parking')
    has_balcony = django_filters.BooleanFilter(field_name='has_balcony')
    has_elevator = django_filters.BooleanFilter(field_name='has_elevator')
    
    # Только рекомендуемые
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    
    class Meta:
        model = Property
        fields = [
            'property_type', 'service_type', 'city', 'status',
            'has_parking', 'has_balcony', 'has_elevator', 'is_featured'
        ]
