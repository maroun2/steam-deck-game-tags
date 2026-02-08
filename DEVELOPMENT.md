# Development Guide

## Quick Start

### Prerequisites

- Node.js v16.14+ and pnpm v9
- Python 3.10+
- Steam Deck (for testing) or Decky Loader development environment

### Installation

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install -r requirements.txt
```

### Building

```bash
# Build the plugin
pnpm run build

# Watch mode (auto-rebuild on changes)
pnpm run watch
```

### Development Workflow

1. **Make changes** to source files in `src/` (frontend) or `backend/` (Python)
2. **Build** with `pnpm run build`
3. **Deploy** to Steam Deck (see Deployment section)
4. **Test** on Steam Deck
5. **Check logs** at `/tmp/decky/plugin.log`

### Deployment to Steam Deck

#### Option 1: Manual Copy

```bash
# Copy to Steam Deck
scp -r dist/ main.py backend/ plugin.json deck@DECK_IP:~/homebrew/plugins/game-progress-tracker/

# Restart Decky
ssh deck@DECK_IP "systemctl restart plugin_loader"
```

#### Option 2: VSCode Tasks

1. Create `.vscode/settings.json`:

```json
{
  "deckip": "192.168.1.XXX",
  "deckport": "22",
  "deckuser": "deck",
  "deckpass": "your-password",
  "deckdir": "/home/deck",
  "pluginname": "game-progress-tracker"
}
```

2. Use VSCode task: `Ctrl+Shift+P` → "Run Task" → "builddeploy"

### Debugging

#### Frontend Debugging

1. Enable CEF Remote Debugging in Decky settings
2. Access Chrome DevTools at `http://DECK_IP:8081`
3. Find "SharedJSContext" for live debugging

#### Backend Debugging

Check Python logs:

```bash
# On Steam Deck
tail -f /tmp/decky/plugin.log

# Or view with grep
grep "GameProgressTracker" /tmp/decky/plugin.log
```

Add debug logging in Python:

```python
import logging
logger = logging.getLogger("GameProgressTracker")
logger.debug("Debug message")
logger.info("Info message")
logger.error("Error message")
```

### Project Structure

```
steam-deck-game-tags/
├── src/                      # TypeScript frontend
│   ├── index.tsx             # Plugin entry point
│   ├── types.ts              # Type definitions
│   ├── components/           # React components
│   │   ├── GameTag.tsx       # Tag badge display
│   │   ├── TagManager.tsx    # Tag editor modal
│   │   └── Settings.tsx      # Settings panel
│   └── hooks/
│       └── useGameTag.ts     # Tag management hook
│
├── backend/                  # Python backend
│   └── src/
│       ├── database.py       # SQLite operations
│       ├── steam_data.py     # Steam VDF parsing
│       └── hltb_service.py   # HowLongToBeat API
│
├── main.py                   # Plugin backend entry
├── plugin.json               # Plugin metadata
├── package.json              # npm configuration
├── tsconfig.json             # TypeScript config
├── rollup.config.js          # Build config
└── requirements.txt          # Python dependencies
```

### Common Issues

#### Issue: Module not found errors

**Solution:** Ensure all dependencies are installed:

```bash
pnpm install
pip install -r requirements.txt
```

#### Issue: Plugin not showing in Decky

**Solution:**
1. Check plugin is in correct directory: `~/homebrew/plugins/game-progress-tracker/`
2. Verify `plugin.json` and `main.py` exist
3. Check Decky logs: `journalctl -u plugin_loader -f`

#### Issue: Tags not appearing

**Solution:**
1. Run "Sync Library" in plugin settings
2. Check backend logs for errors
3. Verify Steam path is detected correctly

#### Issue: HLTB data not found

**Solution:**
- Some games may not be in HowLongToBeat database
- Check similarity threshold (minimum 0.7)
- Manually verify game name matches HLTB

### Testing

See [TEST_PLAN.md](TEST_PLAN.md) for comprehensive testing strategy.

#### Manual Testing Checklist

- [ ] Plugin loads without errors
- [ ] Settings panel opens and displays correctly
- [ ] Sync library works and completes
- [ ] Tags appear on game pages
- [ ] Clicking tag opens TagManager
- [ ] Manual tag override works
- [ ] Reset to automatic works
- [ ] Settings save and persist

### Code Style

**TypeScript:**
- Use functional components with hooks
- Type all function parameters and returns
- Use meaningful variable names
- Add comments for complex logic

**Python:**
- Follow PEP 8 style guide
- Use async/await for I/O operations
- Add docstrings to all functions
- Handle exceptions gracefully

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -am 'Add my feature'`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

### Release Process

1. Update version in `package.json` and `plugin.json`
2. Update CHANGELOG.md
3. Build: `pnpm run build`
4. Test on Steam Deck
5. Create git tag: `git tag v1.0.0`
6. Push: `git push --tags`
7. Create GitHub release with built files

### Useful Commands

```bash
# Rebuild and watch
pnpm run watch

# Check TypeScript errors
pnpm run tsc --noEmit

# Format code
pnpm run prettier --write src/**/*.{ts,tsx}

# Install new dependency
pnpm add package-name
pip install package-name

# Update dependencies
pnpm update
pip install --upgrade -r requirements.txt

# Clean build
rm -rf dist/ node_modules/
pnpm install
pnpm run build
```

### Resources

- [Decky Loader Documentation](https://wiki.deckbrew.xyz/)
- [Decky Plugin Template](https://github.com/SteamDeckHomebrew/decky-plugin-template)
- [Decky Discord](https://deckbrew.xyz/discord)
- [HowLongToBeat Python API](https://github.com/ScrappyCocco/HowLongToBeat-PythonAPI)
