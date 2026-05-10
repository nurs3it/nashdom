# NashDom Design System — MASTER

> Source of truth для UI. Если для конкретной страницы есть файл в `pages/<slug>.md` — он переопределяет правила MASTER только для этой страницы.

## Brand & Mood
- **Tone:** Modern friendly + warm. «Тёплый минимализм»: воздух, скруглённость, фотография — герой.
- **Pattern:** Marketplace / Directory; Bento-вставки для редакционных блоков (подборки, районы, новостройки).
- **Anti-mood:** холодный SaaS-серый, неоновый поп-арт, корпоративно-тяжёлый.

## Color Tokens — «Terra»
HEX-значения; в `globals.css` мапятся на shadcn-переменные.

### Brand
| Token | HEX | Назначение |
|---|---|---|
| terra-50 | #FBF4EE | tints |
| terra-100 | #F5E6D8 | hover ghost |
| terra-200 | #EBC8A8 | subtle bg |
| terra-300 | #DFA478 | illustrations |
| terra-400 | #D08252 | dark-mode primary |
| terra-500 | #C26537 | **brand / primary CTA** |
| terra-600 | #A14E29 | hover |
| terra-700 | #7E3C20 | active / link |
| terra-800 | #5C2C18 | text on light tints |
| terra-900 | #3E1D10 | deep |
| ochre-300 | #E5B547 | dark-mode accent |
| ochre-400 | #D89A20 | **accent / badges** |
| ochre-500 | #B57D17 | accent hover |

### Neutral — Sand (тёплая основа)
| Token | HEX | Назначение |
|---|---|---|
| sand-50 | #FAF7F2 | page bg light |
| sand-100 | #F4EFE6 | surface-muted light |
| sand-200 | #E8E1D3 | border light |
| sand-300 | #C9C0AE | placeholder |
| sand-400 | #9C9381 | muted-foreground light |
| sand-500 | #6E6757 | secondary text |
| sand-600 | #524C3F | dark-mode muted-fg |
| sand-700 | #3D372D | dark-mode border |
| sand-800 | #2A251C | dark-mode surface-muted |
| sand-850 | #221E16 | dark-mode surface (cards) |
| sand-900 | #1B1812 | page bg dark |

### Semantic
| success | #2F8A5B |
| warning | #D89A20 (= ochre-400) |
| danger  | #C8442C |
| info    | #3F7A8E |

### Theme map (shadcn vars)
**Light:** background=sand-50, foreground=#1B1812, card=#FFFFFF, card-fg=#1B1812, popover=#FFFFFF, primary=terra-500, primary-fg=#FFFFFF, secondary=sand-100, secondary-fg=#3D372D, muted=sand-100, muted-fg=sand-400, accent=ochre-400, accent-fg=#1B1812, destructive=#C8442C, border=sand-200, input=sand-200, ring=terra-400.

**Dark:** background=sand-900, foreground=#F4EFE6, card=sand-850, card-fg=#F4EFE6, popover=sand-850, primary=terra-400, primary-fg=#1B1812, secondary=sand-800, secondary-fg=#F4EFE6, muted=sand-800, muted-fg=#9C9381, accent=ochre-300, accent-fg=#1B1812, destructive=#E06B53, border=sand-700, input=sand-700, ring=terra-300.

## Typography
- **Display/Headings:** **Unbounded** (variable, latin+cyrillic) — H1, H2, hero, brand wordmark.
- **UI/Body:** **Manrope** (variable, latin+cyrillic) — всё остальное, включая кнопки, формы, цены.
- **Загрузка:** через `next/font/google` с `display: 'swap'`, переменные `--font-unbounded`, `--font-manrope`.

### Type scale
| Token | size/lh | font/weight |
|---|---|---|
| display-xl | 64/72 | Unbounded 600 |
| display-lg | 48/56 | Unbounded 600 |
| display-md | 36/44 | Unbounded 600 |
| h1 | 32/40 | Unbounded 600 |
| h2 | 28/36 | Unbounded 600 |
| h3 | 22/30 | Manrope 700 |
| h4 | 18/26 | Manrope 700 |
| body-lg | 17/26 | Manrope 400 |
| body | 15/24 | Manrope 400 |
| body-sm | 13/20 | Manrope 500 |
| caption | 12/16 | Manrope 500 (uppercase tracking 0.04em для labels) |
| price-lg | 28/32 | Manrope 700 + tabular-nums |
| price | 20/24 | Manrope 700 + tabular-nums |

## Spacing & Sizing
- 4pt grid: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80 / 120
- Container max-width: 1280px (`max-w-7xl`), padding 16/24/32 по breakpoint
- Touch target min: 44px

## Radii
| sm | 6px | inputs micro |
| md | 10px | buttons, inputs |
| lg | 16px | cards |
| xl | 22px | hero, modals |
| 2xl | 28px | featured |
| full | 9999px | pills, avatars |

## Elevation (тёплая тень)
Цвет тени `rgba(56, 32, 16, x)` в light, `rgba(0,0,0, x)` в dark.

| sm | `0 1 2 .04, 0 0 0 1px .03` | line-shadow |
| md | `0 4 12 .06, 0 1 2 .04` | card |
| lg | `0 12 28 .10, 0 2 6 .04` | hover lift |
| xl | `0 24 48 .14` | modal/hero |

## Motion
- `--duration-fast: 120ms` (hover)
- `--duration: 200ms` (transitions)
- `--duration-slow: 320ms` (modals, sheets)
- `--ease-standard: cubic-bezier(.2,.8,.2,1)`
- `--ease-emphasized: cubic-bezier(.05,.7,.1,1)`
- Уважаем `prefers-reduced-motion`.

## Iconography
- Lucide React, единый stroke 1.75
- Размеры: 16 / 20 / 24 / 32
- Никаких эмоджи в UI как иконок.

---

## Breakpoints
- mobile: <640
- sm: 640
- md: 768
- lg: 1024
- xl: 1280
- 2xl: 1440
Mobile-first.

## Z-index scale
- 0: base
- 10: sticky elements
- 20: dropdowns
- 30: sticky header
- 40: drawers/sheets
- 50: modals
- 60: toasts
- 70: tooltips

## Accessibility (контракт)
- Контраст текста ≥ 4.5:1 во всех темах.
- Focus ring видимый: 2px terra-400 (light) / terra-300 (dark) с offset 2px.
- Все интерактивные ≥ 44×44.
- Цветом не передаём смысл — всегда есть icon/text.

---

## Component Inventory

### Property
- `PropertyCard` — variants: `standard` | `featured` | `compact` | `mini`
- `PropertyBadge` — sale | rent | daily | new | hot | premium
- `PropertyImageGallery` + `Lightbox`
- `PriceTag` — large/medium с tabular-nums и optional «≈ ипотека»
- `PropertyKeyValue` — Bento сетка характеристик
- `PropertyMap` — split-view, кластеры
- `SimilarPropertiesSlider`

### Search & Filters
- `SearchBar` — segmented tabs + три селекта + CTA + chip suggestions
- `FilterSidebar` (desktop), `FilterSheet` (mobile)
- `SortMenu`
- `ActiveFiltersChips`

### Layout
- `SiteHeader` (sticky), `TopBar` (city/lang/theme/login)
- `SiteFooter`
- `SectionHeader` (eyebrow + H + subtitle + actions)
- `ContentContainer`

### Atoms
- `Button` (primary | secondary | outline | ghost | danger; sm | md | lg | icon)
- `IconButton` с tooltip
- `Tag` / `Chip`
- `Toggle` (Тема, табы)
- `Avatar`
- `EmptyState`

### Dashboard
- `StatTile` (Bento, размеры 1×1/2×1/2×2)
- `Sparkline`
- `MiniListingRow`

---

## Information Architecture
Header (5 пунктов): **Купить · Снять · Посуточно · Коммерческая · Карта**
Top-bar mini: город · язык · тема · войти / профиль
Routes:
- `/` Главная
- `/properties` Каталог (?deal=&type=...)
- `/properties/[id]` Карточка
- `/properties/map` Map view
- `/favorites` (tabs: saved / recent / saved-searches)
- `/compare` Сравнение
- `/dashboard/*` Личный кабинет
- `/auth/login`, `/auth/register`
- `/admin/*` Админка
**Без отдельных** `/mortgage`, `/new-buildings` — только контент-блоки.

---

## Implementation Phases
1. **Tokens + theme** — globals.css, шрифты, ThemeProvider, переключатель.
2. **Primitives** — Button, Input, Card, Badge, Tabs, Sheet, Dialog под токены.
3. **Property primitives** — Card/Badge/Gallery/Price/KeyValue.
4. **Search & Filters** — SearchBar, FilterSidebar/Sheet, Sort, Map toggle.
5. **Pages** в порядке: главная → каталог → карточка → дашборд → auth → admin.
