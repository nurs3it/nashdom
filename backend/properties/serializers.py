from rest_framework import serializers
from .models import Property, PropertyType, ServiceType, PropertyImage, Favorite
from users.serializers import UserProfileSerializer


class PropertyTypeSerializer(serializers.ModelSerializer):
    """Сериализатор для типов недвижимости"""
    
    class Meta:
        model = PropertyType
        fields = ('id', 'name', 'slug')


class ServiceTypeSerializer(serializers.ModelSerializer):
    """Сериализатор для видов услуг"""
    
    class Meta:
        model = ServiceType
        fields = ('id', 'name', 'slug')


class PropertyImageSerializer(serializers.ModelSerializer):
    """Сериализатор для изображений объектов"""
    
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'alt_text', 'is_main', 'order')


class PropertyListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка объектов недвижимости"""
    property_type = PropertyTypeSerializer(read_only=True)
    service_type = ServiceTypeSerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'price', 'property_type', 'service_type',
                 'city', 'district', 'area', 'rooms', 'main_image', 
                 'is_featured', 'views_count', 'created_at', 'is_favorited')
    
    def get_main_image(self, obj):
        """Получить главное изображение"""
        if obj.main_image:
            return self.context['request'].build_absolute_uri(obj.main_image.url)
        # Fallback: поиск в связанных изображениях
        main_image = obj.images.filter(is_main=True).first()
        if main_image:
            return self.context['request'].build_absolute_uri(main_image.image.url)
        return None
    
    def get_is_favorited(self, obj):
        """Проверить, добавлен ли объект в избранное текущим пользователем"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, property=obj).exists()
        return False


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детальной информации об объекте"""
    property_type = PropertyTypeSerializer(read_only=True)
    service_type = ServiceTypeSerializer(read_only=True)
    owner = UserProfileSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'description', 'price', 'property_type',
                 'service_type', 'city', 'district', 'address', 'area',
                 'latitude', 'longitude',
                 'rooms', 'floor', 'total_floors', 'has_parking',
                 'has_balcony', 'has_elevator', 'status', 'is_featured',
                 'owner', 'images', 'main_image', 'views_count', 'created_at',
                 'updated_at', 'is_favorited')
    
    def get_main_image(self, obj):
        """Получить главное изображение"""
        if obj.main_image:
            return self.context['request'].build_absolute_uri(obj.main_image.url)
        # Fallback: поиск в связанных изображениях
        main_image = obj.images.filter(is_main=True).first()
        if main_image:
            return self.context['request'].build_absolute_uri(main_image.image.url)
        return None
    
    def get_is_favorited(self, obj):
        """Проверить, добавлен ли объект в избранное текущим пользователем"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, property=obj).exists()
        return False


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления объектов"""
    images = PropertyImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Property
        fields = ('id', 'title', 'description', 'price', 'property_type',
                 'service_type', 'city', 'district', 'address', 'area',
                 'latitude', 'longitude',
                 'rooms', 'floor', 'total_floors', 'has_parking',
                 'has_balcony', 'has_elevator', 'status', 'is_featured',
                 'images', 'uploaded_images')
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        property_obj = Property.objects.create(**validated_data)
        
        # Создание изображений
        for i, image in enumerate(uploaded_images):
            PropertyImage.objects.create(
                property=property_obj,
                image=image,
                is_main=(i == 0),  # Первое изображение - главное
                order=i
            )
        
        return property_obj
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Обновление основных полей
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Добавление новых изображений
        if uploaded_images:
            current_images_count = instance.images.count()
            for i, image in enumerate(uploaded_images):
                PropertyImage.objects.create(
                    property=instance,
                    image=image,
                    order=current_images_count + i
                )
        
        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    """Сериализатор для избранного"""
    property = PropertyListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ('id', 'property', 'created_at')


class PropertyStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики объектов"""
    total_properties = serializers.IntegerField()
    active_properties = serializers.IntegerField()
    sold_properties = serializers.IntegerField()
    rented_properties = serializers.IntegerField()
    properties_by_type = serializers.DictField()
    properties_by_service = serializers.DictField()
    avg_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    most_viewed = PropertyListSerializer(many=True)
