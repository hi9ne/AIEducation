# Настройка переменных окружения

## Автоматическое определение API URL

Фронтенд автоматически определяет, к какому бэкенду обращаться:

- **Локальная разработка**: `http://localhost:8000`
- **Продакшн (Railway)**: `https://backend-production-0046c.up.railway.app`

## Файлы переменных окружения

### env.local (локальная разработка)
```
VITE_API_URL=http://localhost:8000
```

### env.production (продакшн)
```
VITE_API_URL=https://backend-production-0046c.up.railway.app
```

## Как это работает

1. При запуске фронтенда на `localhost` - автоматически используется локальный бэкенд
2. При запуске на `railway.app` - автоматически используется продакшн бэкенд
3. Если нужно переопределить - используйте переменную `VITE_API_URL`

## Проверка

Откройте консоль браузера - там будет сообщение:
```
API URL detected: http://localhost:8000
```
или
```
API URL detected: https://backend-production-0046c.up.railway.app
``` 