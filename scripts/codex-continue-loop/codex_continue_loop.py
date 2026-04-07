#!/usr/bin/env python3
"""
Петля для чата Codex/Cursor: ждёт, пока агент перестанет быть занятым
(нет строки «Running …» / кнопки Stop в панели чата), затем вставляет
сообщение и жмёт Enter. Повторяет цикл.

Требования macOS:
- Python 3.10+
- pip install -r requirements.txt
- Системные настройки → Конфиденциальность → Универсальный доступ:
  разрешить терминалу/Python/IDE, из которого запускаете скрипт.

По умолчанию ищет процесс «Visual Studio Code». Для Cursor: --process Cursor.

Примеры:
  python3 codex_continue_loop.py
  python3 codex_continue_loop.py --process Cursor
  python3 codex_continue_loop.py --message "продолжай дальше" --poll 0.5

Остановка: Ctrl+C (терминал); в .app — кнопка «Остановить» или закрыть окно.

macOS-приложение: ./build_mac_app.sh → dist/Codex Continue Loop.app
Настройки без терминала: ~/Library/Application Support/CodexContinueLoop/settings.json
Лог при запуске из Finder: ~/Library/Logs/CodexContinueLoop.log

Ограничение: опора на дерево доступности Electron; после крупных обновлений
UI текст может измениться — тогда подстройте BUSY_SUBSTRINGS или добавьте свои.
"""

from __future__ import annotations

import argparse
import json
import logging
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Any, Iterable

import AppKit
import ApplicationServices as AX
import pyperclip

_SETTINGS_DIR = Path.home() / "Library" / "Application Support" / "CodexContinueLoop"
_SETTINGS_PATH = _SETTINGS_DIR / "settings.json"
_LOG_PATH = Path.home() / "Library" / "Logs" / "CodexContinueLoop.log"


def _is_frozen() -> bool:
    # py2app выставляет sys.frozen = "macosx_app", PyInstaller — True
    return bool(getattr(sys, "frozen", False))


def _setup_file_logging() -> None:
    if not _is_frozen():
        return
    _LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(message)s",
        filename=str(_LOG_PATH),
        filemode="a",
    )


def _out(msg: str) -> None:
    print(msg, flush=True)
    if logging.getLogger().handlers:
        logging.info(msg)


def _load_settings_file() -> dict[str, Any]:
    if not _SETTINGS_PATH.is_file():
        return {}
    try:
        data = json.loads(_SETTINGS_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, OSError):
        return {}


def _install_signal_handlers() -> None:
    def stop(*_args: object) -> None:
        _out("\nОстановлено.")
        raise SystemExit(0)

    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)


def _interruptible_sleep(seconds: float, stop: threading.Event | None) -> bool:
    """True = запрошена остановка."""
    if stop is None:
        time.sleep(seconds)
        return False
    end = time.monotonic() + seconds
    while time.monotonic() < end:
        if stop.is_set():
            return True
        time.sleep(min(0.15, end - time.monotonic()))
    return False

# Подстроки/точные подписи, по которым считаем, что агент «занят».
# Из дефолтов исключаем слишком широкие совпадения вроде "codex", иначе
# цикл может навсегда видеть агент занятым просто из-за названия продукта в UI.
BUSY_SUBSTRINGS: tuple[str, ...] = (
    "running 1 terminal",
    "running 2 terminals",
    "running 3 terminals",
    "running terminal",
)

BUSY_EXACT_TEXTS: tuple[str, ...] = (
    "running",
    "выполняется",
    "виконується",
    "stop",
    "зупинити",
)

AX_ATTRIBUTES: tuple[str, ...] = (
    AX.kAXTitleAttribute,
    AX.kAXValueAttribute,
    AX.kAXDescriptionAttribute,
    AX.kAXHelpAttribute,
    AX.kAXPlaceholderValueAttribute,
)


def _cf_to_str(val) -> str:
    if val is None:
        return ""
    if isinstance(val, str):
        return val
    s = str(val)
    return s


def _element_children(el) -> list:
    err, children = AX.AXUIElementCopyAttributeValue(el, AX.kAXChildrenAttribute, None)
    if err or children is None:
        return []
    return list(children)


def _collect_texts(el, out: list[str], depth: int, max_depth: int) -> None:
    if depth > max_depth:
        return
    for attr in AX_ATTRIBUTES:
        err, val = AX.AXUIElementCopyAttributeValue(el, attr, None)
        if not err and val is not None:
            t = _cf_to_str(val).strip()
            if t:
                out.append(t)
    for child in _element_children(el):
        _collect_texts(child, out, depth + 1, max_depth)


def pid_for_process_name(name: str) -> int | None:
    ws = AppKit.NSWorkspace.sharedWorkspace()
    needle = name.lower()
    for app in ws.runningApplications():
        if not app.localizedName():
            continue
        n = app.localizedName()
        bid = app.bundleIdentifier() or ""
        if needle in n.lower() or needle in bid.lower():
            return int(app.processIdentifier())
    return None


def _try_open_application(name: str) -> None:
    """Запуск приложения по имени из настроек (как в Dock), например open -a \"Visual Studio Code\"."""
    subprocess.run(["open", "-a", name], check=False)


def _notify_running() -> None:
    """У .app нет окна — только Dock; пуш, чтобы было видно, что программа запущена."""
    if not _is_frozen():
        return
    script = (
        'display notification '
        '"Работает в фоне. Иконка «Codex Continue Loop» в Dock. Остановка: Завершить." '
        'with title "Codex Continue Loop"'
    )
    subprocess.run(["osascript", "-e", script], check=False)


def wait_for_editor_pid(name: str, poll: float, stop: threading.Event | None = None) -> int | None:
    """Ждём редактор; один раз open -a. Если stop — вернуть None при остановке."""
    deadline = time.monotonic() + 2.0
    first = True
    tried_open = False
    while True:
        if stop is not None and stop.is_set():
            return None
        pid = pid_for_process_name(name)
        if pid is not None:
            if not first:
                _out(f"Найден процесс «{name}», PID {pid}.")
            return pid
        if first or time.monotonic() >= deadline:
            _out(f"Ожидание «{name}» — запустите редактор или поправьте settings.json.")
            if not tried_open:
                tried_open = True
                _out(f"Пробуем: open -a {name!r}")
                _try_open_application(name)
            deadline = time.monotonic() + 30.0
            first = False
        if _interruptible_sleep(poll, stop):
            return None


def find_chat_busy_texts(pid: int, max_depth: int = 28) -> list[str]:
    """Собирает видимые строки из окна приложения (упрощённый обход дерева AX)."""
    root = AX.AXUIElementCreateApplication(pid)
    err, windows = AX.AXUIElementCopyAttributeValue(root, AX.kAXWindowsAttribute, None)
    if err or not windows:
        return []
    texts: list[str] = []
    # Фокус на верхнем окне — обычно активное.
    for w in windows[:3]:
        _collect_texts(w, texts, 0, max_depth)
    return texts


def is_agent_busy(texts: Iterable[str], needles: Iterable[str]) -> bool:
    normalized = [t.strip().lower() for t in texts if t and t.strip()]
    if any(text in BUSY_EXACT_TEXTS for text in normalized):
        return True
    return any(needle.lower() in text for text in normalized for needle in needles)


def activate_pid(pid: int) -> None:
    for app in AppKit.NSWorkspace.sharedWorkspace().runningApplications():
        if int(app.processIdentifier()) == pid:
            app.activateWithOptions_(AppKit.NSApplicationActivateIgnoringOtherApps)
            return


def activate_and_paste_enter(app_name: str) -> None:
    """
    Сначала поднимаем VS Code/Cursor на передний план (иначе фокус на окне Tk
    или другом приложении — Cmd+V не попадает в чат).
    """
    # Экранируем кавычки в имени приложения для AppleScript
    safe = app_name.replace("\\", "\\\\").replace('"', '\\"')
    script = f'''
tell application "{safe}"
  activate
end tell
delay 0.4
tell application "System Events"
  keystroke "v" using command down
  delay 0.08
  key code 36
end tell
'''
    subprocess.run(["osascript", "-e", script], check=False)


def _ensure_default_settings_file() -> None:
    """При первом запуске .app кладёт пример settings.json до разбора аргументов."""
    if not _is_frozen():
        return
    _SETTINGS_DIR.mkdir(parents=True, exist_ok=True)
    if _SETTINGS_PATH.exists():
        return
    sample = {
        "process": "Visual Studio Code",
        "message": "продолжай дальше",
        "poll": 0.75,
        "max_depth": 28,
        "needles": "",
        "prime_arm_seconds": 45,
        "send_without_prior_busy": False,
    }
    _SETTINGS_PATH.write_text(json.dumps(sample, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _main_gui(args: argparse.Namespace, needles: tuple[str, ...]) -> int:
    """Окно .app — без него кажется, что программа «не запущена»."""
    import tkinter as tk
    from tkinter import ttk

    _out(f"Лог: {_LOG_PATH}")
    _out(f"Настройки: {_SETTINGS_PATH}")

    stop = threading.Event()
    root = tk.Tk()
    root.title("Codex Continue Loop")
    root.geometry("460x200")
    root.minsize(380, 160)

    status = tk.StringVar(value="Запуск…")
    ttk.Label(root, textvariable=status, wraplength=430, justify="center").pack(
        padx=14, pady=(16, 8), fill="x"
    )
    hint = tk.StringVar(
        value=f"Клик в поле чата {args.process}. Остановка — кнопка ниже или закрыть окно."
    )
    ttk.Label(root, textvariable=hint, wraplength=430, justify="center", font=("", 10)).pack(
        padx=14, pady=4, fill="x"
    )

    def ui(s: str) -> None:
        root.after(0, lambda: status.set(s))

    def on_close() -> None:
        stop.set()
        root.destroy()

    def worker() -> None:
        pid = wait_for_editor_pid(args.process, args.poll, stop)
        if stop.is_set() or pid is None:
            ui("Остановлено.")
            return
        _out(f"PID {pid} ({args.process}). Ожидание простоя → отправка «{args.message}».")
        ui(f"Работает: {args.process}, PID {pid}. Жду «занято» → «простой».")
        _notify_running()
        armed = bool(getattr(args, "send_without_prior_busy", False))
        loop_t0 = time.monotonic()
        forced_arm = False
        try:
            while not stop.is_set():
                texts = find_chat_busy_texts(pid, max_depth=args.max_depth)
                busy = is_agent_busy(texts, needles)
                pas = float(getattr(args, "prime_arm_seconds", 0.0) or 0.0)
                if (
                    not armed
                    and not forced_arm
                    and pas > 0
                    and (time.monotonic() - loop_t0) >= pas
                ):
                    forced_arm = True
                    armed = True
                    ui(
                        "Не видно «занято» в доступности UI — отправлю при следующем простое "
                        f"(через {int(pas)} с ожидания)."
                    )
                if busy:
                    armed = True
                    if _interruptible_sleep(args.poll, stop):
                        break
                    continue
                if armed:
                    pyperclip.copy(args.message)
                    activate_and_paste_enter(args.process)
                    msg = f"{time.strftime('%H:%M:%S')} — отправлено в чат."
                    _out(msg)
                    ui(msg)
                    armed = False
                    if _interruptible_sleep(max(1.0, args.poll * 3), stop):
                        break
                if _interruptible_sleep(args.poll, stop):
                    break
        except Exception as e:
            ui(f"Ошибка: {e}")
            _out(f"Ошибка: {e}")
        finally:
            if not stop.is_set():
                ui("Цикл завершён.")

    def install_signals() -> None:
        def h(*_a: object) -> None:
            root.after(0, on_close)

        signal.signal(signal.SIGINT, h)
        signal.signal(signal.SIGTERM, h)

    btn = ttk.Button(root, text="Остановить", command=on_close)
    btn.pack(pady=(8, 14))
    root.protocol("WM_DELETE_WINDOW", on_close)
    install_signals()
    threading.Thread(target=worker, daemon=True).start()
    root.mainloop()
    _out("Остановлено.")
    return 0


def main() -> int:
    _setup_file_logging()
    _ensure_default_settings_file()

    parser = argparse.ArgumentParser(description="Codex/Cursor: продолжать по кругу после остановки агента.")
    parser.add_argument(
        "--process",
        default="Visual Studio Code",
        help="Имя процесса в Dock / для open -a (по умолчанию Visual Studio Code)",
    )
    parser.add_argument("--message", default="продолжай дальше", help="Текст для отправки")
    parser.add_argument("--poll", type=float, default=0.75, help="Интервал опроса, сек")
    parser.add_argument("--max-depth", type=int, default=28, help="Глубина обхода AX-дерева")
    parser.add_argument(
        "--needles",
        default="",
        help="Доп. подстроки занятости через | (нижний регистр не обязателен)",
    )
    parser.add_argument(
        "--prime-arm-seconds",
        type=float,
        default=45.0,
        help="Если за это время так и не увидели «занято», всё равно разрешить отправку при простое. 0 = выкл.",
    )
    parser.add_argument(
        "--send-without-prior-busy",
        action="store_true",
        help="Сразу слать при простое, без фазы «сначала занято» (опаснее: лишние Enter).",
    )

    file_cfg = _load_settings_file()
    if file_cfg:
        parser.set_defaults(
            process=str(file_cfg.get("process", "Visual Studio Code")),
            message=str(file_cfg.get("message", "продолжай дальше")),
            poll=float(file_cfg.get("poll", 0.75)),
            max_depth=int(file_cfg.get("max_depth", 28)),
            needles=str(file_cfg.get("needles", "")),
            prime_arm_seconds=float(file_cfg.get("prime_arm_seconds", 45.0)),
            send_without_prior_busy=bool(file_cfg.get("send_without_prior_busy", False)),
        )

    args = parser.parse_args()

    extra = [s.strip() for s in args.needles.split("|") if s.strip()]
    needles = tuple({*BUSY_SUBSTRINGS, *tuple(s.lower() for s in extra)})

    if _is_frozen():
        return _main_gui(args, needles)

    _install_signal_handlers()

    pid = wait_for_editor_pid(args.process, args.poll)
    assert pid is not None

    _out(f"PID {pid} ({args.process}). Ожидание простоя → отправка «{args.message}».")
    _out("Остановка: Ctrl+C в терминале.")
    _out("Перед первой отправкой кликните в поле чата Codex — курсор должен мигать там.")

    armed = bool(args.send_without_prior_busy)
    loop_t0 = time.monotonic()
    forced_arm = False
    try:
        while True:
            texts = find_chat_busy_texts(pid, max_depth=args.max_depth)
            busy = is_agent_busy(texts, needles)

            if (
                not armed
                and not forced_arm
                and args.prime_arm_seconds > 0
                and (time.monotonic() - loop_t0) >= args.prime_arm_seconds
            ):
                forced_arm = True
                armed = True
                _out(
                    f"Не видно «занято» в UI — через {int(args.prime_arm_seconds)} с разрешаю отправку при простое."
                )

            if busy:
                armed = True
                time.sleep(args.poll)
                continue

            if armed:
                pyperclip.copy(args.message)
                activate_and_paste_enter(args.process)
                _out(f"{time.strftime('%H:%M:%S')} — отправлено.")
                armed = False
                time.sleep(max(1.0, args.poll * 3))

            time.sleep(args.poll)
    except KeyboardInterrupt:
        _out("\nОстановлено.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
