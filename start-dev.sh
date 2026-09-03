#!/bin/bash
# Запуск dev-сервера. Убивает старые процессы, стартует на порту 3000.
# Использование: ./start-dev.sh
# Лог: /tmp/vite-server.log

set -e
cd "$(dirname "$0")/app"

# Убить всё на порту 3000
kill $(lsof -t -i :3000 2>/dev/null) 2>/dev/null || true
sleep 1

# Запуск vite напрямую (не через npx — без интерактивных промптов)
nohup ./node_modules/.bin/vite --port 3000 --host > /tmp/vite-server.log 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > /tmp/vite-server.pid

# Ждём старта
for i in $(seq 1 10); do
  if lsof -i :3000 -sTCP:LISTEN -P >/dev/null 2>&1; then
    echo "✅ Dev-сервер запущен (PID $SERVER_PID)"
    echo ""
    echo "Ссылки:"
    echo "  Прототип:   http://localhost:3000/onboarding-prototype/"
    echo "  Дашборд:    http://localhost:3000/onboarding-prototype/dashboard.html#participants"
    echo "  Участник:   http://localhost:3000/onboarding-prototype/participant.html?study=-P0Vj_IlrT6ToW9PgiFu&key=-P0VrCFeBUvoxucjf3bh&i=1"
    echo "  Seed:       http://localhost:3000/onboarding-prototype/seed-participant.html"
    echo ""
    echo "Лог: /tmp/vite-server.log"
    echo "Стоп: kill \$(cat /tmp/vite-server.pid)"
    exit 0
  fi
  sleep 1
done

echo "❌ Сервер не запустился. Проверьте /tmp/vite-server.log"
exit 1
