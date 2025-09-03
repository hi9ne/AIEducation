# Настройка переменных окружения для бэкенда

## Локальная разработка

Создайте файл `.env` в папке `backend/app/`:

```bash
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# FreedomPay settings
FREEDOMPAY_MERCHANT_ID=560638
FREEDOMPAY_SECRET_KEY=134v1oCpQehbmqK8
FREEDOMPAY_API_URL=https://api.freedompay.kg/init_payment.php

# Email settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Продакшн (Railway)

В Railway добавьте следующие переменные окружения:

```bash
DEBUG=False
ALLOWED_HOSTS=backend-production-0046c.up.railway.app
FRONTEND_URL=https://frontend-production-1e37.up.railway.app
CSRF_TRUSTED_ORIGINS=https://backend-production-0046c.up.railway.app,https://frontend-production-1e37.up.railway.app

# FreedomPay settings
FREEDOMPAY_MERCHANT_ID=560638
FREEDOMPAY_SECRET_KEY=134v1oCpQehbmqK8
FREEDOMPAY_API_URL=https://api.freedompay.kg/init_payment.php

# Email settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Как это работает

1. **DEBUG**: Включает/выключает режим отладки
2. **ALLOWED_HOSTS**: Разрешенные хосты для Django
3. **FRONTEND_URL**: URL фронтенда для CORS
4. **CSRF_TRUSTED_ORIGINS**: Доверенные источники для CSRF

## Автоматическое переключение

- При `DEBUG=True` - CORS разрешает все источники
- При `DEBUG=False` - CORS разрешает только указанные в `FRONTEND_URL`
- Продакшн URL автоматически добавляется в CORS при необходимости 