# Backend package
# Set up sys.path for py_modules BEFORE any subpackage imports
import sys
from pathlib import Path

# py_modules is in the plugin root directory (one level up from backend/)
_PLUGIN_DIR = Path(__file__).parent.parent.resolve()
_PY_MODULES_DIR = _PLUGIN_DIR / "py_modules"

if str(_PY_MODULES_DIR) not in sys.path:
    sys.path.insert(0, str(_PY_MODULES_DIR))
if str(_PLUGIN_DIR) not in sys.path:
    sys.path.insert(0, str(_PLUGIN_DIR))
