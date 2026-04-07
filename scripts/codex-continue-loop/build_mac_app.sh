#!/bin/sh
set -e
cd "$(dirname "$0")"
python3 -m pip install -q -r requirements.txt py2app
chmod -R u+w build dist 2>/dev/null || true
rm -rf build dist
python3 setup.py py2app

APP="dist/Codex Continue Loop.app"
PLIST="$APP/Contents/Info.plist"
# В каталоге нет MainMenu.nib — ключ NSMainNibFile даёт вылет при запуске из Finder на части систем.
if /usr/libexec/PlistBuddy -c "Print :NSMainNibFile" "$PLIST" >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c "Delete :NSMainNibFile" "$PLIST"
fi
# Снять карантин (загрузка/облако), иначе macOS может блокировать запуск.
xattr -cr "$APP" 2>/dev/null || true

echo "Готово: $(pwd)/$APP"
echo "Первый запуск: Системные настройки → Конфиденциальность → Универсальный доступ — включить для этого приложения."
echo "Настройки (редактор, текст): ~/Library/Application Support/CodexContinueLoop/settings.json"
