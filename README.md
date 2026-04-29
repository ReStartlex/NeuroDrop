# NeuroDrop

Сервис продажи доступа к зарубежным цифровым подпискам (ChatGPT, Cursor, Claude, Gemini, Perplexity, Spotify, YouTube Premium и др.) для пользователей из РФ.

## Документация

- **`PROJECT_BRIEF.md`** — полное техническое задание (бизнес-логика, стек, архитектура, схема БД, фичи, дизайн, этапы).
- **`CLAUDE_KICKOFF_PROMPT.md`** — стартовый промпт для нового чата с Claude.

## Стек

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 · Drizzle ORM · PostgreSQL 16 · Better-Auth · Zod · React Hook Form · Framer Motion · Geist · pino · Vitest.

В Фазе 1 добавятся: Resend, Lava.top, Socket.IO, BullMQ, grammy.

## Локальная разработка

### Требования

- Node.js **22 LTS** (см. `.nvmrc`)
- pnpm **10+** (можно поставить через `npm i -g pnpm` или официальный installer)
- Docker Desktop (для Postgres + Redis)

### Первый запуск

```bash
pnpm install

# секреты
cp .env.example .env.local
pnpm gen:secret  # → подставь в BETTER_AUTH_SECRET
pnpm gen:secret  # → подставь в ENCRYPTION_MASTER_KEY

# инфра
pnpm db:up           # postgres + redis в docker
pnpm db:push         # применить схему drizzle к БД

# приложение
pnpm dev             # http://localhost:3000
```

### Полезные команды

| Скрипт                   | Что делает                                     |
| ------------------------ | ---------------------------------------------- |
| `pnpm dev`               | Запуск Next в dev-режиме (turbopack)           |
| `pnpm build`             | Production-сборка                              |
| `pnpm lint`              | ESLint flat-config                             |
| `pnpm typecheck`         | `tsc --noEmit`                                 |
| `pnpm test`              | Vitest run                                     |
| `pnpm format`            | Prettier --write                               |
| `pnpm db:up` / `db:down` | Поднять / остановить postgres+redis            |
| `pnpm db:push`           | Drizzle push schema → DB                       |
| `pnpm db:generate`       | Сгенерировать миграцию из изменений schema     |
| `pnpm db:migrate`        | Применить миграции                             |
| `pnpm db:studio`         | Открыть Drizzle Studio (визуальный браузер БД) |
| `pnpm gen:secret`        | Сгенерировать 32-байтный hex-ключ              |

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Публичные страницы (общий layout)
│   ├── (auth)/             # login / register
│   ├── account/            # Личный кабинет (auth)
│   ├── admin/              # Админка (role: admin/manager)
│   ├── api/auth/           # Better-Auth handler
│   ├── globals.css         # Tailwind v4 + дизайн-токены
│   └── layout.tsx          # Root layout (Geist fonts)
├── components/
│   ├── ui/                 # Базовые примитивы (button, input, card, …)
│   ├── public/             # Компоненты публичной части (header, footer, формы)
│   ├── admin/              # Компоненты админки (Phase 1+)
│   └── shared/             # Переиспользуемые (logo)
├── lib/
│   ├── auth/               # Better-Auth (server + client)
│   ├── crypto/             # Envelope encryption (AES-256-GCM)
│   ├── db/                 # Drizzle schema + client
│   ├── env.ts              # Zod-валидация ENV
│   ├── logger.ts           # pino
│   └── utils.ts            # cn, formatRub, …
├── server/services/        # Серверная бизнес-логика (Phase 1+)
└── middleware.ts           # Защита /account и /admin
```

## Безопасность

- **Шифрование чувствительных данных клиента** — envelope encryption (AES-256-GCM, master key + per-record DEK). См. `src/lib/crypto/envelope.ts`. Покрыт Vitest-тестами.
- **Audit log** — любой доступ к расшифрованным данным должен писать запись в `audit_log`.
- **Zod на границах** — все ENV, формы, API-вход.
- **`noUncheckedIndexedAccess`**, `exactOptionalPropertyTypes`, `strict` — в `tsconfig.json`.

## Статус

- [x] Фаза 0: инициализация, дизайн-токены, БД-скелет, Better-Auth, envelope encryption, route-скелеты, Docker, CI
- [ ] Фаза 1: главная + каталог + товар + checkout + Lava.top + Resend + минимальная админка
- [ ] Фаза 2: чат + Telegram-бот + промокоды + блог
- [ ] Фаза 3: крипто, бот покупателя, реферальная программа

## Юридический статус

Самозанятый. Лимит 2.4 млн ₽/год. Чеки автоматически через ФНС "Мой налог" (через Lava.top).
