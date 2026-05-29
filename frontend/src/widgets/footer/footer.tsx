import Link from 'next/link';
import { Phone } from 'lucide-react';

const NAV_SECTIONS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Каталог',
    links: [
      { label: 'Купить', href: '/properties?deal=sale' },
      { label: 'Снять', href: '/properties?deal=rent' },
      { label: 'Посуточно', href: '/properties?deal=daily' },
      { label: 'Коммерческая', href: '/properties?deal=commercial' },
    ],
  },
  {
    title: 'Кабинет',
    links: [
      { label: 'Личный кабинет', href: '/dashboard' },
      { label: 'Подать объявление', href: '/dashboard/properties/add' },
      { label: 'Избранное', href: '/favorites' },
      { label: 'Войти', href: '/auth/login' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-semibold shadow-sm transition-transform group-hover:-rotate-3">
                N
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">NashDom</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Тёплый поиск недвижимости по всему Казахстану. Без сложных фильтров и тяжёлых форм.
            </p>
          </div>

          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Контакты
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="tel:+77012891220"
                  className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors tabular-nums"
                >
                  <Phone className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  +7 (701) 289 1220
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NashDom. Все права защищены.</p>
          <p>
            Сделано с заботой в&nbsp;
            <span className="text-foreground font-medium">Казахстане</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
