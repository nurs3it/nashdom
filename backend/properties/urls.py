from django.urls import path
from .views import (
    PropertyTypeListView,
    ServiceTypeListView,
    PropertyListView,
    PropertyDetailView,
    PropertyCreateView,
    PropertyUpdateView,
    PropertyDeleteView,
    FeaturedPropertiesView,
    FavoriteToggleView,
    UserFavoritesView,
    UserPropertiesView,
    property_stats,
    user_property_stats
)

app_name = 'properties'

urlpatterns = [
    # Справочники
    path('types/', PropertyTypeListView.as_view(), name='property_types'),
    path('services/', ServiceTypeListView.as_view(), name='service_types'),
    
    # Объекты недвижимости
    path('', PropertyListView.as_view(), name='property_list'),
    path('featured/', FeaturedPropertiesView.as_view(), name='featured_properties'),
    path('create/', PropertyCreateView.as_view(), name='property_create'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property_detail'),
    path('<int:pk>/update/', PropertyUpdateView.as_view(), name='property_update'),
    path('<int:pk>/delete/', PropertyDeleteView.as_view(), name='property_delete'),
    
    # Избранное
    path('<int:property_id>/favorite/', FavoriteToggleView.as_view(), name='favorite_toggle'),
    path('favorites/', UserFavoritesView.as_view(), name='user_favorites'),
    
    # Пользовательские объекты
    path('my/', UserPropertiesView.as_view(), name='user_properties'),
    
    # Статистика
    path('stats/', property_stats, name='stats'),  # для админов
    path('my/stats/', user_property_stats, name='user_stats'),  # для пользователей
]
