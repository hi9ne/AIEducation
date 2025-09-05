#!/bin/bash

echo "�� Запуск AI Education Platform..."

# Проверка наличия Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python 3.10+"
    exit 1
fi

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 18+"
    exit 1
fi

# Проверка .env файла
if [ ! -f "backend/.env" ]; then
    echo "❌ Файл backend/.env не найден!"
    echo "📝 Создайте файл .env по образцу backend/.env.example"
    echo "📖 Следуйте инструкции в backend/SUPABASE_SETUP.md"
    exit 1
fi

# Запуск бекенда
echo "🔧 Запуск бекенда..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Создание виртуального окружения..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1

# Проверка подключения к Supabase
echo "🔍 Проверка подключения к Supabase..."
python manage.py check --database default > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Ошибка подключения к Supabase!"
    echo "📖 Проверьте настройки в .env файле"
    echo "📖 Следуйте инструкции в SUPABASE_SETUP.md"
    exit 1
fi

# Проверка миграций
echo "🔄 Применение миграций..."
python manage.py migrate > /dev/null 2>&1

# Запуск бекенда в фоне
echo "🌐 Запуск Django сервера на порту 8000..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Ожидание запуска бекенда
sleep 5

# Запуск фронтенда
echo "⚛️ Запуск фронтенда..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей фронтенда..."
    npm install > /dev/null 2>&1
fi

# Запуск фронтенда в фоне
echo "🎨 Запуск React приложения на порту 5173..."
npm run dev &
FRONTEND_PID=$!

# Ожидание запуска фронтенда
sleep 5

echo ""
echo "✅ AI Education Platform запущена!"
echo ""
echo "🌐 Фронтенд: http://localhost:5173"
echo "🔧 Бекенд API: http://localhost:8000/api/"
echo "👨‍💼 Админ панель: http://localhost:8000/admin/"
echo ""
echo "📊 Тестовые данные:"
echo "   Email: test@example.com"
echo "   Пароль: testpass123"
echo ""
echo "   Админ: admin@example.com"
echo "   Пароль: admin123"
echo ""
echo "🛑 Для остановки нажмите Ctrl+C"

# Функция для остановки процессов
cleanup() {
    echo ""
    echo "🛑 Остановка серверов..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Серверы остановлены"
    exit 0
}

# Обработка сигнала остановки
trap cleanup SIGINT SIGTERM

# Ожидание
wait
