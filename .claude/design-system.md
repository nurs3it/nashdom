# Design system

Полный контракт — [`frontend/design-system/MASTER.md`](../frontend/design-system/MASTER.md).
Здесь — краткий обзор и где искать.

## Концепция

**«Тёплый минимализм»** на песочной нейтральной базе. Не холодный SaaS, не агрессивный pop. Главные герои страниц — фотографии недвижимости.

## Палитра «Terra»

| Роль | Hex | CSS-токен |
|---|---|---|
| Brand / primary CTA | `#C26537` (terra-500) | `bg-primary` |
| Accent / badges | `#D89A20` (ochre-400) | `bg-accent` |
| Surface (light) | `#FFFFFF` | `bg-card` |
| Background (light) | `#FAF7F2` (sand-50) | `bg-background` |
| Foreground (light) | `#1B1812` (sand-900) | `text-foreground` |
| Background (dark) | `#1B1812` | `bg-background` |
| Surface (dark) | `#221E16` (sand-850) | `bg-card` |
| Border | `#E8E1D3` (sand-200) light / `#3D372D` (sand-700) dark | `border-border` |

Брендовые шкалы доступны напрямую: `terra-50..900`, `ochre-300..500`, `sand-50..900`.

Семантические: `success` `#2F8A5B`, `warning` (= ochre-400), `danger` `#C8442C`, `info` `#3F7A8E`.

## Шрифты

- **Manrope** — UI/body (variable, кириллица). Default `font-sans`.
- **Unbounded** — display/headings (variable, кириллица). Применяется через `.font-display` или авто к `<h1>`/`<h2>`.

Tabular nums для цен и статистики: `tabular-nums`.

## Радиусы / тени

- `rounded-md` (10px) — кнопки, инпуты
- `rounded-lg` (16px) — карточки
- `rounded-xl` (22px) — hero, модалки small
- `rounded-2xl` (28px) — секции, hero-крупные модалки
- `rounded-full` — pills и avatars

Тени тёплые: `shadow-sm/md/lg/xl`. В тёмной теме — те же классы, но содержимое теней темнее.

## Motion

```css
--duration-fast: 120ms   /* hover */
--duration: 200ms        /* transitions */
--duration-slow: 320ms   /* modals, sheets */
--ease-standard: cubic-bezier(.2, .8, .2, 1)
--ease-emphasized: cubic-bezier(.05, .7, .1, 1)
```

Уважается `prefers-reduced-motion`.

## Иконки

- **Lucide** только. Stroke 1.75 везде.
- Размеры: 16 / 20 / 24 / 32
- **Никаких эмоджи** в продуктовом UI как иконок (👥 🏠 ⚙️ — нет!).

## Где это всё лежит

| Файл | Что |
|---|---|
| [`frontend/design-system/MASTER.md`](../frontend/design-system/MASTER.md) | Полный контракт (источник истины) |
| [`frontend/src/app/globals.css`](../frontend/src/app/globals.css) | CSS-токены, `@theme`, светлая/тёмная тема |
| [`frontend/src/components/ui/`](../frontend/src/components/ui/) | shadcn-примитивы (Button, Card, Input, Sheet, Dialog, Tabs, Select, Badge, Checkbox, Avatar, Textarea, Label, Pagination, Separator, NavigationMenu, AlertDialog, FormField, PhoneInput, Table) |
| [`frontend/src/entities/property/ui/`](../frontend/src/entities/property/ui/) | Доменные компоненты (PropertyCard, PriceTag, DealBadge, FavoriteButton, PropertyImageGallery, PropertyMap, LocationPicker) |
| [`frontend/src/widgets/`](../frontend/src/widgets/) | Layout-каркасы (Header, Footer, DashboardShell, AuthShell) |

## Изменение дизайн-системы

1. Сначала редактируй [`MASTER.md`](../frontend/design-system/MASTER.md) — фиксируй решение
2. Потом меняй CSS-токены в `globals.css`
3. Потом примитивы в `components/ui/` (если изменения затрагивают их API)
4. **Тестируй обе темы** перед коммитом
5. Если меняешь основной brand-цвет — проверь все страницы (особенно auth-shell, partner CTA, badges)
