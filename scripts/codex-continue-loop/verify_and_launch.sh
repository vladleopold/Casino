#!/bin/sh
# Сборка, показ .app в Finder, запуск и проверка по-настоящему:
# успех только если процесс жив непрерывно STABLE_SEC секунд (не старый лог).
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$ROOT/dist/Codex Continue Loop.app"
LOG="$HOME/Library/Logs/CodexContinueLoop.log"
STABLE_SEC="${STABLE_SEC:-30}"
SLEEP_SLICE="${SLEEP_SLICE:-2}"
ROUNDS_MAX="${ROUNDS_MAX:-40}"

"$ROOT/build_mac_app.sh"

set +e
round=0
while [ "$round" -lt "$ROUNDS_MAX" ]; do
  round=$((round + 1))
  pkill -f "Codex Continue Loop.app/Contents/MacOS" 2>/dev/null
  sleep 1

  open -R "$APP"
  open "$APP"
  sleep 2

  mainpid="$(pgrep -nf 'Codex Continue Loop.app/Contents/MacOS')"
  if [ -z "$mainpid" ]; then
    echo "--- круг $round: после open нет процесса, повтор ---"
    tail -8 "$LOG" 2>/dev/null || true
    continue
  fi

  echo "--- круг $round: пойман PID $mainpid, ждём стабильность ${STABLE_SEC}s ---"
  need=$((STABLE_SEC / SLEEP_SLICE))
  [ "$need" -lt 1 ] && need=1
  stable=0
  died=false
  while [ "$stable" -lt "$need" ]; do
    sleep "$SLEEP_SLICE"
    if kill -0 "$mainpid" 2>/dev/null; then
      stable=$((stable + 1))
    else
      echo "--- PID $mainpid завершился через $((stable * SLEEP_SLICE))s (ожидали $STABLE_SEC) — перезапуск ---"
      tail -12 "$LOG" 2>/dev/null || true
      died=true
      break
    fi
  done

  if [ "$died" = false ]; then
    echo "--- УСПЕХ: процесс $mainpid стабильно работал ~${STABLE_SEC}s ---"
    if [ -f "$LOG" ]; then
      tail -15 "$LOG"
    fi
    exit 0
  fi
done

echo "--- НЕ УДАЛОСЬ за $ROUNDS_MAX перезапусков ---"
echo "Проверьте: Универсальный доступ и Автоматизация для .app; путь без проблем; лог: $LOG"
exit 1
