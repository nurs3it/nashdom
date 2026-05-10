# Code style

Конвенции проекта. Это не «hint», это **must-follow** — нарушения будут отмечаться в ревью.

## Общее

### Язык
- **UI и комментарии — русский**, кириллица. Технические идентификаторы и API-поля — английские.
- Кoммиты — английский, но если фича чисто продуктовая — можно русский (`feat: добавлен поиск адреса на карте`).
- README, CLAUDE.md, документация — русский.

### Имена
- TypeScript: `camelCase` для переменных/функций, `PascalCase` для типов и компонентов
- Python: `snake_case` для переменных/функций, `PascalCase` для классов
- БД-поля: `snake_case` (`created_at`, `is_featured`)
- CSS-токены: `--kebab-case` (`--color-primary`, `--shadow-md`)
- Файлы React: `kebab-case.tsx` (`property-card.tsx`)
- Файлы Python: `snake_case.py`

### Комментарии
- Только на «**почему**», не на «что» — если код понятен, не комментируй
- Не оставляй закомментированный код. Удалить через git, история сохранит.
- Никаких `// FIXME`, `// HACK` без issue-ссылки
- Doctring-обязательно для backend serializers/views если поведение не очевидно

## Backend (Python / Django)

### Структура views.py
```python
class PropertyCreateView(generics.CreateAPIView):
    """Создание объявления (только для риелторов и админов)."""
    serializer_class = PropertyCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsRealtorOrSuperAdmin]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
```
- Один view на endpoint, без `ModelViewSet`
- Permissions явно перечислены
- Бизнес-логика — в `perform_*` или в сериализаторе, **не в URL routing**

### Сериализаторы
- Три варианта (List / Detail / CreateUpdate) если поля сильно отличаются
- При добавлении поля — обнови все три (см. `backend/CLAUDE.md`)
- `verbose_name` всегда на русском
- Не пиши голый `fields = '__all__'` — перечисляй явно

### Permissions
- В файле `users/permissions.py`. Если нужна новая — добавь туда, не локально в view
- Имена: `Is...` (`IsOwnerOrAdmin`, `IsRealtorOrSuperAdmin`)

### Migrations
- Никогда не редактировать миграцию вручную
- Всегда коммитить миграции (даже если только этот dev-сервер тронул схему)
- Не использовать `--name` без необходимости — Django сам генерит понятные имена

### Что НЕЛЬЗЯ
- Логика в `__init__.py` модулей
- Печать в `print()` — используй `logging`
- `try: ... except Exception: pass` — указывай конкретный exception
- Хардкод URL — используй `reverse()`
- Хранить пароли в `settings.py` — только через env

## Frontend (TypeScript / React)

### Импорты — порядок
```ts
// 1. External
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

// 2. App / pages / widgets / features / entities (FSD сверху вниз)
import { useAuth } from '@/app/providers/auth-provider';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { PropertyCard } from '@/entities/property';

// 3. Shared
import { propertiesApi } from '@/shared/api';
import { cn } from '@/lib/utils';

// 4. Local
import { Field } from './field';
```

### React-компоненты
```tsx
'use client'; // только если нужен хук/состояние

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FooProps {
  // обязательные сначала, опциональные потом
  title: string;
  className?: string;
}

export function Foo({ title, className }: FooProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      {title}
    </div>
  );
}
```
- **Не используй `React.FC`** — пиши function declaration с typed props
- **`export function` а не `export default function`** — кроме Next-роутов в `app/`
- Один компонент на файл, маленькие хелперы внизу того же файла — ОК
- `interface` для props (легче расширять), `type` для unions/utilities

### Утилитные классы Tailwind
- Сортируй: layout → spacing → sizing → colors → typography → borders → effects → transitions
- Используй `cn(...)` для условных:
  ```tsx
  className={cn(
    'rounded-md border px-3',
    active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
  )}
  ```
- **Никаких raw цветов:** `bg-blue-500` ❌ → `bg-primary` ✅ или `bg-terra-500` ✅
- Брендовые цвета через шкалы: `text-terra-700`, `bg-ochre-300/30`
- Тени — `shadow-sm/md/lg/xl` (тёплые)

### Состояние
| Что | Где |
|---|---|
| Серверные данные | `useQuery` / `useMutation` |
| Локальный UI (open, value) | `useState` |
| Auth | `useAuth()` (Context) |
| Theme | `useTheme()` (Context) |
| Cookies | `shared/lib/cookies.ts` |
| Глобальный shared UI state (редко) | Redux Toolkit slice |

### Что НЕЛЬЗЯ
- **`any`** — если правда не знаешь тип, `unknown`
- **`!important` в CSS** — используй порядок селекторов или утилиты
- **Inline styles `style={{ color: '#fff' }}`** — кроме случаев с динамическими background-image / transform
- **`useEffect` с асинхронным колбэком напрямую** — оборачивай в внутреннюю функцию
- **`<img>` для property-фото** — только `next/image` (исключение: blob-URL в форме редактирования)
- **`<a>`** для внутренней навигации — только `next/link`
- **`alert()`, `confirm()`** — используй shadcn `Dialog` / `AlertDialog` или `sonner` toast
- **Mock данные в production UI** — empty-state с CTA лучше, чем выдуманное число
- **Эмоджи как иконки** в product UI — только Lucide

### Производительность
- `next/image` для всех product images (lazy loading автоматом)
- `<Link prefetch>` (по умолчанию on в Next 15) — не отключай без причины
- Большие списки (50+) — добавь virtualization (react-window) — пока нет, но запланируй
- Карты подгружай через `dynamic({ ssr: false })` — иначе SSR крашится

### Доступность
- Все интерактивные ≥ 44×44 (touch target)
- `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` на всех кнопках
- `aria-label` на icon-only buttons
- `alt` на all images (даже декоративные — `alt=""`)
- Контраст текст-фон ≥ 4.5:1 в обеих темах
- `prefers-reduced-motion` уважается (см. globals.css)

## Git

### Commits
- Формат: `<type>(<scope>): <subject>` или просто `<type>: <subject>`
  - `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `perf`, `test`
- Subject в imperative («add», «fix») без точки в конце
- Тело коммита (если нужно) — после пустой строки, объясняет «зачем» и «как»
- Длина subject ≤ 70 символов

Примеры:
```
feat(properties): добавлен поиск адреса на карте через Nominatim
fix(form): округление координат до 6 знаков перед отправкой
refactor(dashboard): перенос навигации в общий DashboardShell
```

### Branches
- `main` — рабочая ветка (пока что-то типа trunk-based)
- Фича-ветка: `feat/<short-name>` (`feat/saved-searches`)
- Багфикс: `fix/<short-name>`
- Кириллица в названиях веток — нет

### Что не коммитить
- `node_modules/`, `.next/`, `venv/`, `__pycache__/` — в `.gitignore`
- `.env`, `db.sqlite3`, `media/` — в `.gitignore`
- IDE-файлы (`.vscode/`, `.idea/`) — в `.gitignore` (исключение: shared workspace settings)
- API-токены, пароли в коде — никогда

## Файловая структура

### Когда создавать новую папку
- В `entities/` — новая доменная модель (помимо `property`, `user`, `contact`)
- В `widgets/` — переиспользуемый layout/композиция
- В `features/` — новая фича со state
- В `shared/` — нейтральная утилита (cookies, geocode, etc)

### Когда оставить inline
- Маленький компонент-хелпер используется только в одном месте → оставь в том же файле
- Утилита-функция вызывается в 1-2 файлах → можно оставить в файле где используется

## Чек-лист перед PR / merge

- [ ] Сборка проходит (`npm run build` для фронта, `python manage.py check` для бэка)
- [ ] Lint без warnings (`npm run lint`)
- [ ] Нет `console.log`, `print`, `debugger`
- [ ] Нет mock-данных или TODO без issue-ссылки
- [ ] Тёмная тема проверена визуально
- [ ] Mobile (375px) и desktop (1280+) проверены
- [ ] Если меняли модель — миграция создана и закомичена
- [ ] Если меняли API — тип в `frontend/src/shared/types/api.ts` обновлён
- [ ] Если меняли дизайн-токены — `frontend/design-system/MASTER.md` синхронизирован
