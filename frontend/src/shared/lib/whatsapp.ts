/**
 * Утилиты для построения deeplink-ов в WhatsApp.
 *
 * KZ-номера типичные форматы из БД:
 *   "+7 (701) 123-45-67", "+77011234567", "8 701 123 45 67", "87011234567"
 * Нормализуем к чистым цифрам с международным префиксом (без +), как требует wa.me.
 */

const KZ_COUNTRY_CODE = '7';

/**
 * Превращает произвольный телефон в формат, который понимает wa.me.
 * Возвращает null, если из строки нельзя получить валидный номер.
 *
 * Правила:
 *  - оставляем только цифры
 *  - если начинается на 8 и длина 11 → меняем 8 на 7 (KZ legacy формат)
 *  - если 10 цифр → добавляем 7 в начало (без кода страны)
 *  - на выходе должно быть 11–15 цифр
 */
export function normalizePhoneForWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D+/g, '');
  if (!digits) return null;

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = KZ_COUNTRY_CODE + digits.slice(1);
  } else if (digits.length === 10) {
    digits = KZ_COUNTRY_CODE + digits;
  }

  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

/**
 * Собирает wa.me URL с опциональным предзаполненным сообщением.
 * Возвращает null, если телефон невалиден — кнопку нужно скрыть/disable.
 */
export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message?: string,
): string | null {
  const digits = normalizePhoneForWhatsApp(phone);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
