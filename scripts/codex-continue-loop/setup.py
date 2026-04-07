"""
Сборка нативного macOS-приложения (.app):
  cd scripts/codex-continue-loop
  python3 -m pip install -r requirements.txt py2app
  python3 setup.py py2app

Результат: dist/Codex Continue Loop.app
"""

from setuptools import setup

APP = ["codex_continue_loop.py"]
DATA_FILES = []
OPTIONS = {
    "argv_emulation": False,
    "plist": {
        "CFBundleName": "Codex Continue Loop",
        "CFBundleDisplayName": "Codex Continue Loop",
        "CFBundleIdentifier": "com.casino.codexContinueLoop",
        "CFBundleVersion": "1.0.0",
        "CFBundleShortVersionString": "1.0.0",
        "NSHighResolutionCapable": True,
        "LSMinimumSystemVersion": "10.15",
        "NSAppleEventsUsageDescription": "Нужно для вставки текста в чат через события клавиатуры (System Events).",
    },
    "packages": [
        "objc",
        "Foundation",
        "CoreFoundation",
        "AppKit",
        "ApplicationServices",
        "pyperclip",
        "tkinter",
    ],
}

setup(
    name="CodexContinueLoop",
    app=APP,
    data_files=DATA_FILES,
    options={"py2app": OPTIONS},
    setup_requires=["py2app"],
)
