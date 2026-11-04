# Progday — PWA «День программиста»

Небольшое PWA: программист записывает план на день и получает push в начале каждой задачи. В рабочие часы приложение раз в час напоминает встать, размяться или выпрямить спину. Push приходит, даже когда приложение закрыто.

## Стек

- **Фронт:** Vue 3 (Composition API, `<script setup>`), Vite, Vue Router, Pinia, Tailwind CSS
- **Сервер:** Node.js, Express, web-push
- **Данные:** `db.json` (без настоящей БД)
- **Push:** Web Push API + VAPID, service worker

## Структура

```
progday/
├── src/
│   ├── components/
│   │   ├── pages/            # страницы роутера (Сегодня, Новая задача, Настройки)
│   │   └── datas/            # сторы Pinia (tasks, settings)
│   ├── router/
│   ├── App.vue
│   └── main.js
├── public/
│   └── sw.js                 # service worker для push
├── server/
│   ├── server.js             # Node + Express API
│   ├── db.json               # хранилище данных (в git не идёт)
│   └── .env                  # VAPID-ключи (в git не идёт)
└── vite.config.js
```

## Как запустить

### 1. Установить зависимости

```bash
# в корне проекта (фронт)
npm install

# в папке server (бэк)
cd server
npm install
cd ..
```

### 2. Сгенерировать VAPID-ключи

```bash
cd server
npx web-push generate-vapid-keys --json
```

### 3. Создать `.env` файлы

Из примеров:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp server/db.example.json server/db.json
```

В `.env` подставить публичный ключ из шага 2, в `server/.env` — оба ключа и свой email.

### 4. Запустить

В двух терминалах:

```bash
# фронт
npm run dev

# сервер
cd server
npm run dev
```

Фронт откроется на `http://localhost:5173`, сервер слушает `3000`.

## API сервера

| Метод | Адрес | Что делает |
|---|---|---|
| GET    | `/tasks`         | Список задач |
| POST   | `/tasks`         | Создать задачу |
| PATCH  | `/tasks/:id`     | Обновить поля задачи |
| DELETE | `/tasks/:id`     | Удалить задачу |
| GET    | `/settings`      | Настройки |
| PUT    | `/settings`      | Сохранить настройки |
| POST   | `/subscribe`     | Подписка на push |

## Путь push от сервера до телефона

1. Браузер при подписке даёт уникальный **endpoint** (адрес Google или Apple Push Service).
2. Сервер хранит эти endpoint-ы в `db.json`.
3. Раз в минуту сервер проверяет задачи и настройки.
4. Если пора — подписывает push своим приватным VAPID-ключом и шлёт на endpoint.
5. Push Service (Google / Apple) доставляет push на устройство.
6. Браузер пробуждает service worker.
7. Service worker показывает уведомление.

## Что защищено от повторов

- Сервер хранит, какие push уже отправлены, чтобы один и тот же не ушёл дважды.
- После перезапуска сервера пропущенные за время простоя push не приходят разом — проверяется только текущий момент.

## HTTPS и телефон

Для подписки и push нужен HTTPS. На телефоне локальный `http://localhost` не работает. Для теста поднимается туннель, например Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:5173
```

На iPhone (iOS 16.4+) push приходит только после **Share → Add to Home Screen**.
