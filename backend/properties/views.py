from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404

from .models import Property, PropertyType, ServiceType, Favorite
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer, 
    PropertyCreateUpdateSerializer,
    PropertyTypeSerializer,
    ServiceTypeSerializer,
    FavoriteSerializer,
    PropertyStatsSerializer
)
from .filters import PropertyFilter
from users.permissions import IsOwnerOrReadOnly, IsOwnerOrSuperAdmin, IsSuperAdminUser, IsRealtorOrSuperAdmin


class PropertyTypeListView(generics.ListAPIView):
    """Список типов недвижимости"""
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ServiceTypeListView(generics.ListAPIView):
    """Список видов услуг"""
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class PropertyListView(generics.ListAPIView):
    """Список объектов недвижимости с фильтрацией и поиском"""
    queryset = Property.objects.filter(status='active').select_related(
        'property_type', 'service_type', 'owner'
    ).prefetch_related('images')
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'city', 'district', 'address']
    ordering_fields = ['price', 'area', 'created_at', 'views_count']
    ordering = ['-created_at']


class PropertyDetailView(generics.RetrieveAPIView):
    """Детальная информация об объекте"""
    queryset = Property.objects.select_related(
        'property_type', 'service_type', 'owner'
    ).prefetch_related('images')
    serializer_class = PropertyDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Увеличиваем счетчик просмотров
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PropertyCreateView(generics.CreateAPIView):
    """Создание нового объекта недвижимости"""
    serializer_class = PropertyCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PropertyUpdateView(generics.UpdateAPIView):
    """Обновление объекта недвижимости (владелец или superadmin)"""
    serializer_class = PropertyCreateUpdateSerializer
    permission_classes = [IsOwnerOrSuperAdmin]
    
    def get_queryset(self):
        # Супер-админы видят все объекты, пользователи только свои
        if (hasattr(self.request.user, 'role') and 
            self.request.user.role == 'superadmin') or self.request.user.is_staff:
            return Property.objects.all()
        return Property.objects.filter(owner=self.request.user)


class PropertyDeleteView(generics.DestroyAPIView):
    """Удаление объекта недвижимости (владелец или superadmin)"""
    permission_classes = [IsOwnerOrSuperAdmin]
    
    def get_queryset(self):
        # Супер-админы могут удалять любые объекты, пользователи только свои
        if (hasattr(self.request.user, 'role') and 
            self.request.user.role == 'superadmin') or self.request.user.is_staff:
            return Property.objects.all()
        return Property.objects.filter(owner=self.request.user)


class UserPropertiesView(generics.ListAPIView):
    """Объекты недвижимости текущего пользователя"""
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'city', 'district', 'address']
    ordering_fields = ['price', 'area', 'created_at', 'views_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user).select_related(
            'property_type', 'service_type'
        ).prefetch_related('images')


class FeaturedPropertiesView(generics.ListAPIView):
    """Рекомендуемые объекты"""
    queryset = Property.objects.filter(
        status='active', 
        is_featured=True
    ).select_related('property_type', 'service_type')[:6]
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class FavoriteToggleView(APIView):
    """Добавление/удаление объекта из избранного"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id)
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, 
            property=property_obj
        )
        
        if not created:
            # Если уже в избранном, удаляем
            favorite.delete()
            return Response(
                {'message': 'Удалено из избранного', 'is_favorited': False},
                status=status.HTTP_200_OK
            )
        else:
            # Добавляем в избранное
            return Response(
                {'message': 'Добавлено в избранное', 'is_favorited': True},
                status=status.HTTP_201_CREATED
            )


class UserFavoritesView(generics.ListAPIView):
    """Избранные объекты пользователя"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related(
            'property__property_type', 'property__service_type'
        )


@api_view(['GET'])
@permission_classes([IsSuperAdminUser])
def property_stats(request):
    """Статистика объектов недвижимости (только для админов)"""
    total_properties = Property.objects.count()
    active_properties = Property.objects.filter(status='active').count()
    sold_properties = Property.objects.filter(status='sold').count()
    rented_properties = Property.objects.filter(status='rented').count()
    
    # Статистика по типам
    properties_by_type = dict(
        Property.objects.values('property_type__name')
        .annotate(count=Count('id'))
        .values_list('property_type__name', 'count')
    )
    
    # Статистика по услугам
    properties_by_service = dict(
        Property.objects.values('service_type__name')
        .annotate(count=Count('id'))
        .values_list('service_type__name', 'count')
    )
    
    # Средняя цена
    avg_price = Property.objects.aggregate(avg_price=Avg('price'))['avg_price'] or 0
    
    # Самые просматриваемые
    most_viewed = Property.objects.order_by('-views_count')[:5]
    most_viewed_data = PropertyListSerializer(most_viewed, many=True, context={'request': request}).data
    
    stats = {
        'total_properties': total_properties,
        'active_properties': active_properties,
        'sold_properties': sold_properties,
        'rented_properties': rented_properties,
        'properties_by_type': properties_by_type,
        'properties_by_service': properties_by_service,
        'avg_price': avg_price,
        'most_viewed': most_viewed_data
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_property_stats(request):
    """Статистика объектов пользователя"""
    user_properties = Property.objects.filter(owner=request.user)
    
    total_properties = user_properties.count()
    active_properties = user_properties.filter(status='active').count()
    sold_properties = user_properties.filter(status='sold').count()
    rented_properties = user_properties.filter(status='rented').count()
    
    # Общие просмотры
    total_views = user_properties.aggregate(total_views=Count('views_count'))['total_views'] or 0
    
    # Самые просматриваемые объекты пользователя
    most_viewed = user_properties.order_by('-views_count')[:3]
    most_viewed_data = PropertyListSerializer(most_viewed, many=True, context={'request': request}).data
    
    stats = {
        'total_properties': total_properties,
        'active_properties': active_properties,
        'sold_properties': sold_properties,
        'rented_properties': rented_properties,
        'total_views': total_views,
        'most_viewed': most_viewed_data
    }
    
    return Response(stats)