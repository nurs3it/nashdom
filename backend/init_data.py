#!/usr/bin/env python
"""
Скрипт для инициализации базовых данных в базе данных Django
"""

import os
import sys
import django
from decimal import Decimal

# Настройка Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nashdom_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import PropertyType, ServiceType, Property, PropertyImage
from contacts.models import ContactRequest

User = get_user_model()


def create_property_types():
    """Создание типов недвижимости"""
    types = [
        ('Квартира', 'apartment'),
        ('Частный дом', 'house'),
        ('Участок', 'land'),
        ('Коммерческое помещение', 'commercial'),
    ]
    
    for name, slug in types:
        PropertyType.objects.get_or_create(
            name=name,
            defaults={'slug': slug}
        )
    
    print("✓ Типы недвижимости созданы")


def create_service_types():
    """Создание видов услуг"""
    types = [
        ('Продажа', 'sale'),
        ('Аренда', 'rent'),
    ]
    
    for name, slug in types:
        ServiceType.objects.get_or_create(
            name=name,
            defaults={'slug': slug}
        )
    
    print("✓ Виды услуг созданы")


def create_admin_user():
    """Создание администратора"""
    if not User.objects.filter(email='admin@nashdom.kz').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@nashdom.kz',
            password='admin123',
            first_name='Администратор',
            last_name='Системы',
            role='admin',
            is_verified=True
        )
        print("✓ Администратор создан (admin@nashdom.kz / admin123)")
    else:
        print("✓ Администратор уже существует")


def create_sample_users():
    """Создание примеров пользователей"""
    users_data = [
        {
            'username': 'realtor1',
            'email': 'realtor@nashdom.kz',
            'password': 'realtor123',
            'first_name': 'Алия',
            'last_name': 'Нурбекова',
            'role': 'realtor',
            'phone': '+7 777 123 45 67',
            'is_verified': True,
        },
        {
            'username': 'client1',
            'email': 'client@nashdom.kz',
            'password': 'client123',
            'first_name': 'Асылбек',
            'last_name': 'Токтаров',
            'role': 'client',
            'phone': '+7 777 987 65 43',
            'is_verified': True,
        }
    ]
    
    for user_data in users_data:
        if not User.objects.filter(email=user_data['email']).exists():
            User.objects.create_user(**user_data)
            print(f"✓ Пользователь {user_data['email']} создан")


def create_sample_properties():
    """Создание примеров объектов недвижимости"""
    # Получаем необходимые данные
    apartment_type = PropertyType.objects.get(slug='apartment')
    house_type = PropertyType.objects.get(slug='house')
    sale_service = ServiceType.objects.get(slug='sale')
    rent_service = ServiceType.objects.get(slug='rent')
    realtor = User.objects.get(email='realtor@nashdom.kz')
    
    properties_data = [
        {
            'title': '3-комнатная квартира в центре Алматы',
            'description': 'Просторная квартира в престижном районе города. Евроремонт, встроенная мебель, панорамные окна.',
            'price': Decimal('45000000'),
            'property_type': apartment_type,
            'service_type': sale_service,
            'city': 'Алматы',
            'district': 'Медеуский район',
            'address': 'ул. Абая, 150',
            'area': 95.5,
            'rooms': 3,
            'floor': 8,
            'total_floors': 15,
            'has_parking': True,
            'has_balcony': True,
            'has_elevator': True,
            'is_featured': True,
            'owner': realtor,
            'main_image': 'properties/apartment1.svg',
        },
        {
            'title': '2-комнатная квартира для аренды',
            'description': 'Уютная квартира в жилом комплексе. Мебель, техника, охраняемая территория.',
            'price': Decimal('200000'),
            'property_type': apartment_type,
            'service_type': rent_service,
            'city': 'Алматы',
            'district': 'Бостандыкский район',
            'address': 'пр. Аль-Фараби, 77',
            'area': 65.0,
            'rooms': 2,
            'floor': 5,
            'total_floors': 9,
            'has_parking': True,
            'has_balcony': False,
            'has_elevator': True,
            'is_featured': False,
            'owner': realtor,
            'main_image': 'properties/apartment1.svg',
        },
        {
            'title': 'Коттедж с участком в Каскелене',
            'description': 'Двухэтажный дом с большим участком. Баня, гараж, сад. Экологически чистый район.',
            'price': Decimal('75000000'),
            'property_type': house_type,
            'service_type': sale_service,
            'city': 'Каскелен',
            'district': '',
            'address': 'ул. Центральная, 25',
            'area': 180.0,
            'rooms': 5,
            'floor': None,
            'total_floors': None,
            'has_parking': True,
            'has_balcony': True,
            'has_elevator': False,
            'is_featured': True,
            'owner': realtor,
            'main_image': 'properties/house1.svg',
        },
    ]
    
    for prop_data in properties_data:
        if not Property.objects.filter(title=prop_data['title']).exists():
            Property.objects.create(**prop_data)
            print(f"✓ Объект '{prop_data['title']}' создан")


def main():
    """Основная функция инициализации"""
    print("Начинаем инициализацию данных...")
    
    try:
        create_property_types()
        create_service_types()
        create_admin_user()
        create_sample_users()
        create_sample_properties()
        
        print("\n🎉 Инициализация завершена успешно!")
        print("\nДанные для входа:")
        print("Администратор: admin@nashdom.kz / admin123")
        print("Риелтор: realtor@nashdom.kz / realtor123")
        print("Клиент: client@nashdom.kz / client123")
        
    except Exception as e:
        print(f"\n❌ Ошибка при инициализации: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
