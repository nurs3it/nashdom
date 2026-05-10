import Link from 'next/link';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Логотип и описание */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6" />
              <span className="font-bold">NashDom</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ваш надежный партнер в поиске идеальной недвижимости. 
              Помогаем найти дом мечты с 2024 года.
            </p>
          </div>

          {/* Навигация */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
                  Недвижимость
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Услуги */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Услуги</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties?service_type=sale" className="text-muted-foreground hover:text-foreground transition-colors">
                  Продажа
                </Link>
              </li>
              <li>
                <Link href="/properties?service_type=rent" className="text-muted-foreground hover:text-foreground transition-colors">
                  Аренда
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Разместить объявление
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+7 (777) 123-45-67</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@nashdom.kz</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>г. Алматы, ул. Абая 123</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 NashDom. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
