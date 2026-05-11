#!/usr/bin/env python
"""
Seed-скрипт для инициализации демо-данных.
Идемпотентен: повторный запуск не создаёт дубликатов (get_or_create).

Безопасно запускать на проде сразу после первого migrate.
"""

import os
import sys
import django
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nashdom_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Property, PropertyType, ServiceType

User = get_user_model()


# ---------- Справочники ----------

PROPERTY_TYPES = [
    ('Квартира',                'apartment'),
    ('Частный дом',             'house'),
    ('Студия',                  'studio'),
    ('Коммерческое помещение',  'commercial'),
    ('Участок',                 'land'),
]

SERVICE_TYPES = [
    ('Продажа',     'sale'),
    ('Аренда',      'rent'),
    ('Посуточно',   'daily'),
    ('Коммерческая',  'commercial'),
]


def create_property_types():
    for name, slug in PROPERTY_TYPES:
        PropertyType.objects.get_or_create(slug=slug, defaults={'name': name})
    print(f"✓ Типы недвижимости: {PropertyType.objects.count()}")


def create_service_types():
    for name, slug in SERVICE_TYPES:
        ServiceType.objects.get_or_create(slug=slug, defaults={'name': name})
    print(f"✓ Виды услуг: {ServiceType.objects.count()}")


# ---------- Пользователи ----------

def create_admin_user():
    user, created = User.objects.get_or_create(
        email='admin@nashdom.kz',
        defaults={
            'username': 'admin',
            'first_name': 'Администратор',
            'last_name': 'Системы',
            'role': 'superadmin',
            'is_verified': True,
            'is_staff': True,
            'is_superuser': True,
        },
    )
    if created:
        user.set_password('admin123')
        user.save()
        print("✓ Админ создан: admin@nashdom.kz / admin123")
    else:
        # Гарантируем правильную роль и права при повторном запуске
        changed = False
        if user.role != 'superadmin':
            user.role = 'superadmin'
            changed = True
        if not user.is_superuser or not user.is_staff:
            user.is_superuser = True
            user.is_staff = True
            changed = True
        if changed:
            user.save()
            print("✓ Админ обновлён (роль/права)")
        else:
            print("• Админ уже существует")


def create_sample_users():
    seeds = [
        dict(
            email='realtor@nashdom.kz',
            username='realtor1',
            password='realtor123',
            first_name='Алия',
            last_name='Нурбекова',
            role='realtor',
            phone='+7 777 123 45 67',
            is_verified=True,
        ),
        dict(
            email='client@nashdom.kz',
            username='client1',
            password='client123',
            first_name='Асылбек',
            last_name='Токтаров',
            role='client',
            phone='+7 777 987 65 43',
            is_verified=True,
        ),
    ]
    for seed in seeds:
        password = seed.pop('password')
        user, created = User.objects.get_or_create(
            email=seed['email'],
            defaults=seed,
        )
        if created:
            user.set_password(password)
            user.save()
            print(f"✓ Пользователь {user.email} создан / пароль: {password}")
        else:
            print(f"• Пользователь {user.email} уже существует")


# ---------- Объявления ----------

def create_sample_properties():
    apartment = PropertyType.objects.get(slug='apartment')
    house = PropertyType.objects.get(slug='house')
    studio = PropertyType.objects.get(slug='studio')
    commercial_t = PropertyType.objects.get(slug='commercial')

    sale = ServiceType.objects.get(slug='sale')
    rent = ServiceType.objects.get(slug='rent')
    daily = ServiceType.objects.get(slug='daily')
    commercial_s = ServiceType.objects.get(slug='commercial')

    realtor = User.objects.get(email='realtor@nashdom.kz')

    properties = [
        # Алматы
        dict(
            title='3-комнатная в Медеуском районе с панорамным видом',
            description=(
                'Просторная квартира в престижном районе с видом на горы. Евроремонт 2024 года, '
                'встроенная кухня, тёплый пол. Закрытая территория, охрана, два подземных паркинга.'
            ),
            price=Decimal('45000000'),
            property_type=apartment, service_type=sale,
            city='Алматы', district='Медеуский', address='пр. Достык, 162',
            area=95.5, rooms=3, floor=8, total_floors=15,
            latitude=Decimal('43.235800'), longitude=Decimal('76.956700'),
            has_parking=True, has_balcony=True, has_elevator=True,
            is_featured=True,
        ),
        dict(
            title='2-комнатная в Бостандыкском районе, аренда',
            description=(
                'Уютная квартира в новом ЖК. Полностью меблирована, бытовая техника. '
                'Рядом метро Сайран, школа, парк.'
            ),
            price=Decimal('220000'),
            property_type=apartment, service_type=rent,
            city='Алматы', district='Бостандыкский', address='ул. Розыбакиева, 247',
            area=64.0, rooms=2, floor=5, total_floors=12,
            latitude=Decimal('43.214600'), longitude=Decimal('76.892300'),
            has_parking=True, has_balcony=True, has_elevator=True,
            is_featured=False,
        ),
        dict(
            title='1-комнатная в Алмалинском районе',
            description=(
                'Светлая квартира с современным ремонтом. Шкаф-купе, новая сантехника. '
                'Рядом ТРЦ, остановка, тихий двор.'
            ),
            price=Decimal('22500000'),
            property_type=apartment, service_type=sale,
            city='Алматы', district='Алмалинский', address='ул. Тулебаева, 38',
            area=42.0, rooms=1, floor=3, total_floors=9,
            latitude=Decimal('43.260100'), longitude=Decimal('76.946800'),
            has_parking=False, has_balcony=True, has_elevator=True,
            is_featured=False,
        ),
        dict(
            title='Студия посуточно у Кок-Тобе',
            description=(
                'Стильная студия в новом доме. Две минуты до канатной дороги. Wi-Fi, '
                'Smart-TV, чистое бельё. Подходит для бизнес-поездок и пар.'
            ),
            price=Decimal('18000'),
            property_type=studio, service_type=daily,
            city='Алматы', district='Медеуский', address='ул. Омарова, 44',
            area=28.0, rooms=1, floor=7, total_floors=10,
            latitude=Decimal('43.225400'), longitude=Decimal('76.971200'),
            has_parking=False, has_balcony=False, has_elevator=True,
            is_featured=True,
        ),
        dict(
            title='Дом 180 м² в Каскелене',
            description=(
                'Двухэтажный кирпичный дом на участке 8 соток. Баня, гараж на 2 машины, '
                'сад с плодовыми деревьями. Тихий район, хорошие соседи.'
            ),
            price=Decimal('72000000'),
            property_type=house, service_type=sale,
            city='Каскелен', district='', address='мкр. Алмалы, ул. Тауелсиздик, 25',
            area=180.0, rooms=5, floor=None, total_floors=2,
            latitude=Decimal('43.197600'), longitude=Decimal('76.626900'),
            has_parking=True, has_balcony=True, has_elevator=False,
            is_featured=True,
        ),
        # Астана
        dict(
            title='Студия в Есильском районе у Байтерека',
            description=(
                'Современная студия в новостройке. Полная отделка, кухонный гарнитур. '
                'Развитая инфраструктура: ТРЦ Хан Шатыр, EXPO, набережная Ишима.'
            ),
            price=Decimal('19500000'),
            property_type=studio, service_type=sale,
            city='Астана', district='Есильский', address='пр. Туран, 56',
            area=32.0, rooms=1, floor=12, total_floors=22,
            latitude=Decimal('51.128400'), longitude=Decimal('71.430200'),
            has_parking=True, has_balcony=True, has_elevator=True,
            is_featured=False,
        ),
        dict(
            title='1-комнатная аренда в Алматы районе Астаны',
            description=(
                'Светлая квартира в спокойном районе. Меблирована: диван, кровать, шкаф. '
                'Стиральная машина, холодильник, плита. Без хозяев.'
            ),
            price=Decimal('170000'),
            property_type=apartment, service_type=rent,
            city='Астана', district='Алматинский', address='ул. Богенбай батыра, 56',
            area=48.0, rooms=1, floor=4, total_floors=9,
            latitude=Decimal('51.158300'), longitude=Decimal('71.443500'),
            has_parking=False, has_balcony=True, has_elevator=True,
            is_featured=False,
        ),
        dict(
            title='2-комнатная посуточно у Хан-Шатыра',
            description=(
                'Квартира европейского класса. 5 минут пешком до Хан-Шатыра. '
                'Постельное бельё, кухонные принадлежности, ежедневная уборка по запросу.'
            ),
            price=Decimal('25000'),
            property_type=apartment, service_type=daily,
            city='Астана', district='Есильский', address='ул. Сыганак, 14',
            area=58.0, rooms=2, floor=10, total_floors=18,
            latitude=Decimal('51.130800'), longitude=Decimal('71.405100'),
            has_parking=True, has_balcony=False, has_elevator=True,
            is_featured=True,
        ),
        # Шымкент
        dict(
            title='2-комнатная в центре Шымкента',
            description=(
                'Просторная квартира с косметическим ремонтом. В шаговой доступности рынок '
                'и центральный парк. Тёплый дом, низкие коммунальные.'
            ),
            price=Decimal('18500000'),
            property_type=apartment, service_type=sale,
            city='Шымкент', district='Аль-Фарабийский', address='ул. Казыбек би, 25',
            area=52.0, rooms=2, floor=2, total_floors=5,
            latitude=Decimal('42.315500'), longitude=Decimal('69.587000'),
            has_parking=False, has_balcony=True, has_elevator=False,
            is_featured=False,
        ),
        # Коммерция
        dict(
            title='Помещение под кафе/салон, 80 м²',
            description=(
                'Первая линия, отдельный вход с улицы. Витринные окна, высокие потолки 3.5 м. '
                'Электричество 25 кВт, вода, канализация. Без посредников.'
            ),
            price=Decimal('38000000'),
            property_type=commercial_t, service_type=commercial_s,
            city='Алматы', district='Алмалинский', address='ул. Богенбай батыра, 134',
            area=80.0, rooms=None, floor=1, total_floors=9,
            latitude=Decimal('43.250900'), longitude=Decimal('76.940700'),
            has_parking=True, has_balcony=False, has_elevator=False,
            is_featured=False,
        ),
    ]

    created_count = 0
    for data in properties:
        obj, created = Property.objects.get_or_create(
            title=data['title'],
            defaults={**data, 'owner': realtor},
        )
        if created:
            created_count += 1
            print(f"  + {obj.title}")
    print(f"✓ Объявлений: создано {created_count} из {len(properties)} (всего в БД: {Property.objects.count()})")


# ---------- main ----------

def main():
    print("Seeding data → Supabase / local DB\n")
    try:
        create_property_types()
        create_service_types()
        create_admin_user()
        create_sample_users()
        create_sample_properties()
        print("\n🎉 Готово.")
        print("\nДоступы:")
        print("  Админ:    admin@nashdom.kz / admin123")
        print("  Риелтор:  realtor@nashdom.kz / realtor123")
        print("  Клиент:   client@nashdom.kz / client123")
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        raise


if __name__ == '__main__':
    main()
