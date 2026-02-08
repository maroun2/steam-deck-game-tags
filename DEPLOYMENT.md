# Deployment Guide - Game Progress Tracker

## Pre-Deployment Checklist ✅

- [x] All Python dependencies installed
- [x] All Node.js dependencies installed
- [x] Frontend built successfully (`dist/index.js`)
- [x] Backend tests passing
- [x] No build errors
- [x] Test script created and working

---

## Files to Deploy

### Required Files
```
game-progress-tracker/
├── main.py                    # Main plugin entry point
├── plugin.json                # Plugin metadata
├── requirements.txt           # Python dependencies
├── backend/                   # Backend Python modules
│   └── src/
│       ├── __init__.py
│       ├── database.py
│       ├── steam_data.py
│       └── hltb_service.py
└── dist/                      # Built frontend
    ├── index.js
    ├── index.d.ts
    └── types.d.ts
```

### Optional Files (for reference)
- `README.md` - User documentation
- `PLAN.md` - Development plan
- `TEST_PLAN.md` - Testing strategy
- `TEST_RESULTS.md` - Test results

---

## Deployment Options

### Option 1: Manual Copy via SSH (Recommended)

#### Step 1: Package the plugin
```bash
cd /home/maron/projects/steam-deck-game-tags

# Create a clean deployment package
mkdir -p deploy/game-progress-tracker
cp -r dist backend main.py plugin.json requirements.txt deploy/game-progress-tracker/
```

#### Step 2: Copy to Steam Deck
```bash
# Replace DECK_IP with your Steam Deck's IP address
scp -r deploy/game-progress-tracker deck@DECK_IP:~/homebrew/plugins/

# Or use rsync for better transfer
rsync -avz --progress deploy/game-progress-tracker/ deck@DECK_IP:~/homebrew/plugins/game-progress-tracker/
```

#### Step 3: Install dependencies on Steam Deck
```bash
ssh deck@DECK_IP

cd ~/homebrew/plugins/game-progress-tracker
pip install --user -r requirements.txt
```

#### Step 4: Restart Decky Loader
```bash
# On Steam Deck
systemctl --user restart plugin_loader

# Or restart from Decky menu
```

---

### Option 2: Development Mode (For Iteration)

#### Setup VSCode Remote SSH
1. Install "Remote - SSH" extension in VSCode
2. Connect to Steam Deck via SSH
3. Open plugin folder: `~/homebrew/plugins/game-progress-tracker`
4. Edit files directly on Steam Deck
5. Run `npm run build` on Steam Deck when changes are made
6. Reload plugin from Decky menu

**Advantages:**
- Faster iteration
- Live testing
- Immediate feedback

**Disadvantages:**
- Requires Node.js on Steam Deck
- More setup required

---

### Option 3: Decky Plugin Store (Future)

Once testing is complete and stable:

1. Fork the Decky Plugin Database repository
2. Add plugin metadata
3. Submit pull request
4. Wait for approval
5. Users can install via Decky Store

---

## Post-Deployment Testing

### Initial Smoke Test
1. **Check Plugin Loads**
   - [ ] Plugin appears in Decky menu
   - [ ] Icon displays correctly
   - [ ] No error messages in logs

2. **Check Settings Panel**
   - [ ] Settings panel opens
   - [ ] All UI elements visible
   - [ ] No console errors (check CEF debugger)

3. **Check Database**
   - [ ] Database file created at `~/.local/share/decky/game-progress-tracker/game_tracker.db`
   - [ ] Tables initialized
   - [ ] Default settings saved

### Functional Testing

#### Test 1: Manual Tag Assignment
1. Open a game page in library
2. Plugin should detect the appid
3. Click "Sync Single Game" in settings
4. Wait for sync to complete
5. Navigate back to game page
6. Verify badge appears (if conditions met)
7. Click badge to open TagManager
8. Set a manual tag
9. Verify tag updates and displays correctly

#### Test 2: Library Sync
1. Open plugin settings
2. Click "Sync Entire Library"
3. Wait for completion (may take several minutes)
4. Check statistics update
5. Navigate to various game pages
6. Verify tags display correctly

#### Test 3: Settings Modification
1. Change "Mastered Multiplier" slider
2. Change "In Progress Threshold" slider
3. Toggle "Auto-Tagging" on/off
4. Verify settings persist after reload

---

## Troubleshooting

### Plugin Doesn't Load

**Symptoms:** Plugin not visible in Decky menu

**Check:**
```bash
# View Decky logs
tail -f /tmp/decky/plugin.log

# Check plugin folder structure
ls -la ~/homebrew/plugins/game-progress-tracker/

# Verify plugin.json is valid
cat ~/homebrew/plugins/game-progress-tracker/plugin.json | python3 -m json.tool
```

**Common Fixes:**
- Ensure all files copied correctly
- Check plugin.json syntax
- Verify Python dependencies installed
- Restart Decky Loader

---

### Python Import Errors

**Symptoms:** Plugin loads but crashes immediately

**Check:**
```bash
# Test Python imports
python3 -c "from backend.src.database import Database"
python3 -c "import howlongtobeatpy"
python3 -c "import aiosqlite"
python3 -c "import vdf"
```

**Fix:**
```bash
# Reinstall dependencies
pip install --user -r requirements.txt

# Or install globally
sudo pip install -r requirements.txt
```

---

### Tags Don't Appear

**Symptoms:** Plugin works but no tags show on game pages

**Possible Causes:**
1. Library not synced yet → Run "Sync Library"
2. Steam path not detected → Check logs for Steam path
3. VDF parsing errors → Check permissions on Steam files
4. Route patching failed → Check CEF debugger console

**Debug Steps:**
```bash
# Check database has data
sqlite3 ~/.local/share/decky/game-progress-tracker/game_tracker.db "SELECT COUNT(*) FROM game_tags;"

# Check Steam path detection
tail -f /tmp/decky/plugin.log | grep -i steam

# Enable CEF debugger
# In Decky settings, enable "CEF Remote Debugging"
# Open browser to: http://DECK_IP:8081
```

---

### HLTB Data Not Loading

**Symptoms:** Tags work but no HLTB completion times

**Possible Causes:**
1. Network connectivity issues
2. HLTB API rate limiting
3. Game name mismatch (similarity too low)

**Check:**
```bash
# Test HLTB connectivity
python3 -c "
import asyncio
from howlongtobeatpy import HowLongToBeat
async def test():
    hltb = HowLongToBeat()
    results = await hltb.async_search('Portal 2')
    print(results[0].game_name if results else 'No results')
asyncio.run(test())
"
```

**Fix:**
- Wait a few minutes (rate limiting)
- Check internet connection
- Try syncing again later
- Some games may not be in HLTB database (expected)

---

### Database Errors

**Symptoms:** SQLite errors in logs

**Check:**
```bash
# Check database file permissions
ls -la ~/.local/share/decky/game-progress-tracker/

# Verify database integrity
sqlite3 ~/.local/share/decky/game-progress-tracker/game_tracker.db "PRAGMA integrity_check;"

# Check tables exist
sqlite3 ~/.local/share/decky/game-progress-tracker/game_tracker.db ".tables"
```

**Fix:**
```bash
# Backup and recreate database
mv ~/.local/share/decky/game-progress-tracker/game_tracker.db{,.backup}
# Restart plugin to recreate
```

---

## Log Files

### Important Logs
1. **Decky Plugin Log:**
   - Location: `/tmp/decky/plugin.log`
   - Shows Python errors and plugin lifecycle

2. **Frontend Console:**
   - Access via CEF debugger: `http://DECK_IP:8081`
   - Shows JavaScript errors and React issues

3. **System Journal:**
   ```bash
   journalctl -u plugin_loader --since "10 minutes ago"
   ```

---

## Performance Considerations

### Initial Library Sync Times
- 100 games: ~3-5 minutes
- 500 games: ~15-20 minutes
- 1000 games: ~30-40 minutes

**Note:** Rate limited to 1 HLTB request per second

### Database Size
- 100 games: ~2-5 MB
- 500 games: ~10-20 MB
- 1000 games: ~20-40 MB

### Memory Usage
- Python backend: ~50-100 MB
- Minimal impact on Steam Deck performance

---

## Rollback Procedure

If something goes wrong:

```bash
# Remove plugin
rm -rf ~/homebrew/plugins/game-progress-tracker

# Remove database (optional)
rm -rf ~/.local/share/decky/game-progress-tracker

# Restart Decky
systemctl --user restart plugin_loader
```

---

## Success Criteria

Plugin is successfully deployed when:

- [x] Plugin appears in Decky menu
- [x] Settings panel opens without errors
- [x] Library sync completes successfully
- [x] Tags appear on game pages
- [x] Tag badges are clickable and open TagManager
- [x] Manual tag changes persist
- [x] Statistics update correctly
- [x] No errors in logs during normal operation

---

## Support & Debugging

### Useful Commands

```bash
# Monitor logs in real-time
tail -f /tmp/decky/plugin.log

# Check plugin status
systemctl --user status plugin_loader

# Restart plugin
systemctl --user restart plugin_loader

# Query database
sqlite3 ~/.local/share/decky/game-progress-tracker/game_tracker.db "SELECT * FROM game_tags LIMIT 10;"

# Check Python version
python3 --version

# List installed packages
pip list | grep -E "(howlong|aiosqlite|vdf)"
```

### Getting Help

1. Check logs first
2. Review this troubleshooting guide
3. Create GitHub issue with:
   - Log excerpts
   - Steps to reproduce
   - Steam Deck OS version
   - Python version

---

## Next Steps After Successful Deployment

1. **User Testing**
   - Use plugin with your game library
   - Test various game types
   - Note any unexpected behavior

2. **Performance Monitoring**
   - Check battery impact
   - Monitor memory usage
   - Verify no game performance impact

3. **Feature Requests**
   - Document desired enhancements
   - Prioritize improvements
   - Consider Phase 4 features from PLAN.md

4. **Community Release**
   - Create release notes
   - Take screenshots
   - Submit to Decky Plugin Store

---

## Maintenance

### Regular Tasks
- Monitor for HLTB API changes
- Update dependencies periodically
- Backup database before major updates
- Test after Steam client updates

### Updates
When updating the plugin:
1. Backup database first
2. Copy new files over old ones
3. Run `pip install -r requirements.txt` again
4. Restart Decky Loader
5. Test basic functionality

---

## Conclusion

This plugin is ready for deployment! Follow the steps above for a smooth installation process. Report any issues discovered during testing.

**Good luck with your deployment! 🎮**