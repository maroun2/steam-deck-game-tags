"""
Steam Deck Game Progress Tracker - Backend Module
"""

# Set up sys.path for py_modules BEFORE any other imports in this package
# This ensures third-party packages (aiosqlite, vdf, howlongtobeatpy) can be found
import sys
from pathlib import Path

# py_modules is in the plugin root directory (two levels up from backend/src/)
_PLUGIN_DIR = Path(__file__).parent.parent.parent.resolve()
_PY_MODULES_DIR = _PLUGIN_DIR / "py_modules"

if str(_PY_MODULES_DIR) not in sys.path:
    sys.path.insert(0, str(_PY_MODULES_DIR))
if str(_PLUGIN_DIR) not in sys.path:
    sys.path.insert(0, str(_PLUGIN_DIR))

__version__ = "1.0.0"