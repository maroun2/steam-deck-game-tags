# GitHub Deployment Guide

## Overview

This guide explains how to deploy the Game Progress Tracker plugin to GitHub for easy installation via Decky Loader's "Install from URL" feature.

---

## 🚀 Quick Start

### Prerequisites
- GitHub account
- Git installed locally
- Plugin built and tested locally

### Steps Summary
1. Create GitHub repository
2. Push code to GitHub
3. Enable GitHub Pages
4. Create a release with version tag
5. Share installation URL with users

---

## 📝 Detailed Deployment Steps

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `steam-deck-game-tags` (or your preferred name)
3. Description: "Automatic game tagging plugin for Steam Deck Decky Loader"
4. Choose Public (required for Decky Loader installation)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
cd /home/maron/projects/steam-deck-game-tags

# Initialize git if not already done
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/steam-deck-game-tags.git

# Add all files
git add .

# Create .gitignore for build artifacts
cat > .gitignore << 'EOF'
# Build artifacts
node_modules/
dist/
plugin-build/
*.zip

# Python cache
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.so

# Environment
.env
.venv
venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database
*.db
*.db-journal

# Test files
INSTALL_URL.txt
EOF

# Commit
git commit -m "Initial commit: Game Progress Tracker v1.0.0

- Automatic game tagging (Completed, In Progress, Mastered)
- HowLongToBeat integration
- Achievement tracking
- Manual tag override
- Configurable thresholds
- Library statistics

Generated with Claude Code
via Happy

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" section in left sidebar
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/docs`
5. Click "Save"
6. Wait 1-2 minutes for deployment
7. Your install page will be available at:
   `https://YOUR_USERNAME.github.io/steam-deck-game-tags/`

### Step 4: Update GitHub Pages URLs

Edit `docs/index.html` and replace all instances of:
- `YOUR_USERNAME` → Your actual GitHub username
- `steam-deck-game-tags` → Your repo name (if different)

```bash
# Quick replace (Linux/Mac)
sed -i 's/YOUR_USERNAME/your-actual-username/g' docs/index.html

# Commit the changes
git add docs/index.html
git commit -m "Update GitHub Pages URLs"
git push
```

### Step 5: Create First Release

#### Option A: Using GitHub Web Interface (Recommended for first release)

1. Go to your repository on GitHub
2. Click "Releases" in right sidebar
3. Click "Create a new release"
4. Click "Choose a tag" → Type `v1.0.0` → Click "Create new tag"
5. Release title: `Game Progress Tracker v1.0.0`
6. Description:

```markdown
## Game Progress Tracker v1.0.0

🎮 First stable release!

### Installation

**Install from URL:**
```
https://github.com/YOUR_USERNAME/steam-deck-game-tags/releases/download/v1.0.0/game-progress-tracker-v1.0.0.zip
```

**Quick Install:** Visit https://YOUR_USERNAME.github.io/steam-deck-game-tags/

### Features
- 🎯 Automatic game tagging (Completed, In Progress, Mastered)
- ⏱️ HowLongToBeat integration for completion times
- 🏆 Achievement tracking
- ✏️ Manual tag override with visual indicators
- 📊 Library statistics
- ⚙️ Configurable thresholds

### First Time Setup
1. Enable Developer Mode in Decky Loader
2. Install plugin from URL above
3. Open plugin settings
4. Click "Sync Entire Library"
5. Wait for sync to complete (5-30 minutes depending on library size)

### Requirements
- Steam Deck with Decky Loader installed
- Internet connection for HLTB data
- Developer mode enabled

### Known Issues
- None yet! Please report any bugs you find.

### Support
Report issues at: https://github.com/YOUR_USERNAME/steam-deck-game-tags/issues
```

7. **Build and attach the plugin zip:**

```bash
# On your local machine
cd /home/maron/projects/steam-deck-game-tags

# Build the plugin
./build-plugin.sh v1.0.0

# This creates: game-progress-tracker-v1.0.0.zip
```

8. Drag and drop `game-progress-tracker-v1.0.0.zip` to the release assets
9. Click "Publish release"

#### Option B: Using GitHub CLI (Automated)

```bash
# Install GitHub CLI if not installed
# https://cli.github.com/

# Authenticate
gh auth login

# Build plugin
./build-plugin.sh v1.0.0

# Create release
gh release create v1.0.0 \
  game-progress-tracker-v1.0.0.zip \
  --title "Game Progress Tracker v1.0.0" \
  --notes-file release_notes.md

# Create 'latest' tag for permanent URL
gh release create latest \
  game-progress-tracker-v1.0.0.zip \
  --title "Latest Release" \
  --latest
```

#### Option C: Using GitHub Actions (Automated on Tag Push)

The repository includes `.github/workflows/release.yml` which automatically builds and releases when you push a version tag:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Build the frontend
# 2. Create plugin zip
# 3. Create GitHub release
# 4. Upload zip as release asset
```

---

## 📦 Plugin Distribution URLs

After creating a release, you'll have these URLs:

### Specific Version URL (Recommended)
```
https://github.com/YOUR_USERNAME/steam-deck-game-tags/releases/download/v1.0.0/game-progress-tracker-v1.0.0.zip
```
- Points to exact version
- Stable, never changes
- Users get specific version

### Latest Release URL
```
https://github.com/YOUR_USERNAME/steam-deck-game-tags/releases/latest/download/game-progress-tracker-latest.zip
```
- Always points to newest version
- URL stays the same
- Users automatically get updates
- Requires "latest" release tag

### GitHub Pages Install Page
```
https://YOUR_USERNAME.github.io/steam-deck-game-tags/
```
- User-friendly install instructions
- Copy-paste URL button
- Feature descriptions
- Automatically updates when you update docs

---

## 🔄 Updating the Plugin

### For New Versions

1. **Make your changes** to the code
2. **Test locally** to ensure everything works
3. **Update version** in `package.json`:
   ```json
   {
     "version": "1.1.0"
   }
   ```

4. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Version 1.1.0: Add new features"
   git push
   ```

5. **Create new release:**

   **Option A: GitHub Actions (Automatic)**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   # Workflow automatically builds and releases
   ```

   **Option B: Manual**
   ```bash
   ./build-plugin.sh v1.1.0
   gh release create v1.1.0 game-progress-tracker-v1.1.0.zip \
     --title "Game Progress Tracker v1.1.0" \
     --notes "Bug fixes and improvements"
   ```

---

## 📊 Monitoring

### Check Deployment Status

#### GitHub Pages
- Go to Settings → Pages
- See deployment status and URL
- View deployment history

#### GitHub Actions
- Go to Actions tab
- See workflow runs
- Check build logs if errors occur

#### Releases
- Go to Releases section
- View download counts
- See which versions users are installing

---

## 🐛 Troubleshooting

### GitHub Pages Not Loading

**Problem:** 404 error on GitHub Pages URL

**Solutions:**
1. Verify Pages is enabled in Settings → Pages
2. Ensure `docs/index.html` exists in main branch
3. Wait 5 minutes after enabling Pages
4. Check "Actions" tab for Pages deployment status
5. Hard refresh browser (Ctrl+Shift+R)

### Release Build Fails

**Problem:** GitHub Actions workflow fails

**Solutions:**
1. Check Actions tab for error logs
2. Verify `dist/index.js` is built correctly
3. Ensure all required files are committed
4. Check `.github/workflows/release.yml` syntax
5. Verify Node.js version matches (16.14+)

### Plugin Won't Install from URL

**Problem:** Decky Loader shows error when installing

**Solutions:**
1. Verify Developer Mode is enabled
2. Check URL is correct (copy from release page)
3. Ensure repository is Public
4. Verify zip file structure is correct
5. Check zip file size (<50MB recommended)
6. Try downloading zip manually to verify it's not corrupted

### Zip File Structure Issues

**Problem:** Plugin installs but doesn't work

**Solution:** Verify zip structure:
```bash
unzip -l game-progress-tracker-v1.0.0.zip

# Should show:
game-progress-tracker/
  ├── dist/
  │   └── index.js
  ├── backend/
  ├── main.py
  ├── plugin.json
  ├── package.json
  ├── requirements.txt
  └── LICENSE
```

---

## 🎯 Best Practices

### Versioning
- Use semantic versioning: `v<major>.<minor>.<patch>`
- Major: Breaking changes
- Minor: New features, backwards compatible
- Patch: Bug fixes only

### Release Notes
- Always include installation instructions
- List new features
- Document bug fixes
- Note breaking changes
- Include support links

### Testing Before Release
1. Build locally: `./build-plugin.sh v1.x.x`
2. Test zip file on Steam Deck
3. Verify all features work
4. Check logs for errors
5. Only then create GitHub release

### GitHub Actions
- Test workflow on a test repository first
- Use draft releases for testing
- Enable notifications for workflow failures
- Review logs after each release

---

## 📋 Release Checklist

Before creating a release:

- [ ] All code changes committed and pushed
- [ ] Version updated in `package.json`
- [ ] README.md updated with new features
- [ ] CHANGELOG.md updated (if you have one)
- [ ] Built locally and tested: `./build-plugin.sh vX.X.X`
- [ ] Plugin works on actual Steam Deck
- [ ] No errors in Decky logs
- [ ] GitHub Pages URLs updated
- [ ] Release notes prepared
- [ ] Screenshots/GIFs updated (if applicable)

---

## 🌟 Promotion

After successful deployment:

### Share on Reddit
- r/SteamDeck
- r/DeckHacks
- Include screenshots
- Link to GitHub Pages

### Share on Discord
- Steam Deck Discord
- Decky Loader Discord
- Show demo/video

### Submit to Decky Store
- Once stable and tested
- Follow submission guidelines
- Easier for users to discover

---

## 📚 Additional Resources

- [Decky Loader Plugin Development](https://wiki.deckbrew.xyz/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## ✅ Success Criteria

Your deployment is successful when:

- [x] Code is on GitHub (public repository)
- [x] GitHub Pages site is live
- [x] At least one release is created
- [x] Zip file is attached to release
- [x] Installation URL works in Decky Loader
- [x] Plugin installs and functions correctly
- [x] Users can find and install your plugin

---

## 🎉 Congratulations!

Your plugin is now deployed and ready for the Steam Deck community!

**Your Installation URL:**
```
https://YOUR_USERNAME.github.io/steam-deck-game-tags/
```

**Quick Install URL:**
```
https://github.com/YOUR_USERNAME/steam-deck-game-tags/releases/latest/download/game-progress-tracker-latest.zip
```