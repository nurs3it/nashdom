"""
Зачистка PropertyImage / Property.main_image, файлы которых физически отсутствуют
в текущем storage backend.

Полезно после миграции с локального диска Render (эфемерный) на Supabase Storage:
все старые записи указывают на /media/... которого больше нет.

Использование:
    python manage.py cleanup_missing_images --dry-run   # только показать
    python manage.py cleanup_missing_images             # удалить битые
"""

from django.core.management.base import BaseCommand

from properties.models import Property, PropertyImage


class Command(BaseCommand):
    help = 'Удаляет записи PropertyImage и сбрасывает Property.main_image, если файл отсутствует в storage.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Только показать что будет удалено, без изменений в БД.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        broken_images = []
        for img in PropertyImage.objects.all().iterator():
            field = img.image
            if not field or not field.name:
                broken_images.append((img.pk, '<пустое поле>'))
                continue
            try:
                exists = field.storage.exists(field.name)
            except Exception as exc:  # noqa: BLE001 — storage может бросать что угодно
                self.stderr.write(f'  ! storage.exists({field.name}) упал: {exc}')
                exists = False
            if not exists:
                broken_images.append((img.pk, field.name))

        broken_mains = []
        for prop in Property.objects.exclude(main_image='').exclude(main_image__isnull=True).iterator():
            field = prop.main_image
            if not field or not field.name:
                continue
            try:
                exists = field.storage.exists(field.name)
            except Exception as exc:  # noqa: BLE001
                self.stderr.write(f'  ! storage.exists({field.name}) упал: {exc}')
                exists = False
            if not exists:
                broken_mains.append((prop.pk, field.name))

        self.stdout.write(self.style.WARNING(f'Битых PropertyImage: {len(broken_images)}'))
        for pk, name in broken_images:
            self.stdout.write(f'  - id={pk}  {name}')

        self.stdout.write(self.style.WARNING(f'Битых Property.main_image: {len(broken_mains)}'))
        for pk, name in broken_mains:
            self.stdout.write(f'  - property id={pk}  {name}')

        if dry_run:
            self.stdout.write(self.style.NOTICE('\n--dry-run: ничего не удалено.'))
            return

        if not broken_images and not broken_mains:
            self.stdout.write(self.style.SUCCESS('Нечего чистить.'))
            return

        deleted_images, _ = PropertyImage.objects.filter(
            pk__in=[pk for pk, _ in broken_images]
        ).delete()

        cleared_mains = Property.objects.filter(
            pk__in=[pk for pk, _ in broken_mains]
        ).update(main_image='')

        self.stdout.write(self.style.SUCCESS(
            f'Удалено PropertyImage: {deleted_images}, сброшено Property.main_image: {cleared_mains}.'
        ))
