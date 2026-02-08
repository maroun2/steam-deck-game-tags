# Release Checklist

Use this checklist before creating each release.

---

## Pre-Release

### Code Quality
- [ ] All features implemented and working
- [ ] All tests passing: `python3 tests/test_backend.py`
- [ ] Frontend builds without errors: `npm run build`
- [ ] No console errors in browser dev tools
- [ ] Python backend has no errors
- [ ] Code is properly formatted
- [ ] No debug/console.log statements left in code
- [ ] __pycache__ directories excluded from build

### Version Management
- [ ] Version number updated in `package.json`
- [ ] Version number updated in `plugin.json` (if applicable)
- [ ] Version number decided: v`<major>`.`<minor>`.`<patch>`
- [ ] CHANGELOG.md updated with changes (if you have one)

### Documentation
- [ ] README.md is up to date
- [ ] All features documented
- [ ] Installation instructions are current
- [ ] Screenshots/GIFs are current (if applicable)
- [ ] API changes documented
- [ ] Breaking changes clearly noted

### Testing
- [ ] Plugin builds successfully: `./build-plugin.sh v1.0.0`
- [ ] Zip file structure verified: `unzip -l game-progress-tracker-v1.0.0.zip`
- [ ] Plugin tested locally (if possible)
- [ ] Database migrations work (if applicable)
- [ ] Settings persist correctly
- [ ] All plugin API methods work
- [ ] No memory leaks detected

---

## GitHub Preparation

### Repository
- [ ] All changes committed
- [ ] All commits pushed to main branch
- [ ] Repository is Public
- [ ] License file present (MIT)
- [ ] .gitignore properly configured
- [ ] No sensitive data in commits

### GitHub Pages
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] `docs/index.html` exists and is updated
- [ ] URLs in `docs/index.html` updated with your username
- [ ] Pages site loads correctly
- [ ] Install instructions are clear

### GitHub Actions
- [ ] `.github/workflows/release.yml` exists
- [ ] Workflow syntax is valid
- [ ] Required secrets configured (if any)
- [ ] Previous workflow runs successful (if applicable)

---

## Release Creation

### Release Preparation
- [ ] Build plugin: `./build-plugin.sh v1.0.0`
- [ ] Verify zip file size (<50MB)
- [ ] Test zip extraction
- [ ] Release notes prepared

### Release Content
Release notes should include:
- [ ] Version number in title
- [ ] Installation URL
- [ ] Link to GitHub Pages install page
- [ ] List of new features
- [ ] List of bug fixes
- [ ] Breaking changes (if any)
- [ ] Known issues
- [ ] Requirements
- [ ] Support/issue tracker link

### Creating Release

**Option A: GitHub Web Interface**
- [ ] Go to repository → Releases → "Create a new release"
- [ ] Create tag: `v1.0.0`
- [ ] Release title: "Game Progress Tracker v1.0.0"
- [ ] Paste release notes
- [ ] Upload `game-progress-tracker-v1.0.0.zip`
- [ ] Publish release
- [ ] Verify download link works

**Option B: GitHub Actions (Automated)**
- [ ] Create tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Wait for GitHub Actions to complete
- [ ] Check Actions tab for success/failure
- [ ] Verify release was created
- [ ] Verify zip file was uploaded

**Option C: GitHub CLI**
- [ ] Build: `./build-plugin.sh v1.0.0`
- [ ] Create release: `gh release create v1.0.0 game-progress-tracker-v1.0.0.zip --title "..." --notes "..."`
- [ ] Verify release created

---

## Post-Release

### Verification
- [ ] Release appears on GitHub
- [ ] Zip file is attached and downloadable
- [ ] Download URL is correct format
- [ ] GitHub Pages shows correct version
- [ ] Installation URL works in Decky Loader Developer Mode

### Testing on Steam Deck
- [ ] Enable Developer Mode in Decky
- [ ] Install from URL using release link
- [ ] Plugin appears in Decky menu
- [ ] Plugin initializes without errors
- [ ] Check logs: `/tmp/decky/plugin.log`
- [ ] All features work as expected
- [ ] Settings save correctly
- [ ] Sync library works
- [ ] Tags display on game pages

### Communication
- [ ] Update any pinned issues
- [ ] Close completed milestone (if using)
- [ ] Post release announcement (if applicable):
  - [ ] Reddit (r/SteamDeck, r/DeckHacks)
  - [ ] Discord servers
  - [ ] Twitter/X (if you have account)
- [ ] Respond to any immediate feedback

### Documentation
- [ ] Update main README with latest version
- [ ] Update any wikis or external docs
- [ ] Create/update video tutorial (optional)
- [ ] Update screenshots in README (if changed)

---

## Rollback Plan

If something goes wrong:

### Emergency Rollback
- [ ] Delete broken release from GitHub
- [ ] Revert problematic commits
- [ ] Create hotfix release
- [ ] Notify users via release notes

### Hotfix Process
1. [ ] Identify and fix critical issue
2. [ ] Increment patch version (e.g., v1.0.0 → v1.0.1)
3. [ ] Follow release checklist for hotfix
4. [ ] Note in release: "Hotfix for v1.0.0"

---

## Version-Specific Notes

### v1.0.0 - Initial Release
Special considerations:
- [ ] Extra testing needed
- [ ] Clear "first release" messaging
- [ ] Set expectations about bugs
- [ ] Emphasize feedback channels
- [ ] Consider marking as "beta" if unsure

### v1.x.x - Feature Release
- [ ] Backward compatibility verified
- [ ] Database migrations tested
- [ ] Settings migration tested
- [ ] Previous version users can upgrade

### v2.0.0 - Major Release
- [ ] Breaking changes documented
- [ ] Migration guide written
- [ ] Announce well in advance
- [ ] Consider deprecation period

---

## Success Metrics

After release, monitor:

### Technical
- [ ] No critical bugs reported in first 24 hours
- [ ] Error rate acceptable in logs
- [ ] Performance metrics acceptable
- [ ] No security issues reported

### User Feedback
- [ ] Installation success rate
- [ ] Feature requests reasonable
- [ ] Bug reports manageable
- [ ] Community reception positive

### Download Stats
- [ ] Check GitHub release download counts
- [ ] Monitor GitHub stars/forks
- [ ] Track issue reports rate

---

## Next Release Planning

After successful release:

- [ ] Create milestone for next version
- [ ] Label issues by priority
- [ ] Plan feature roadmap
- [ ] Schedule next release date (if applicable)
- [ ] Close current milestone
- [ ] Thank contributors

---

## Emergency Contacts

If critical issues arise:

- **Issue Tracker:** https://github.com/YOUR_USERNAME/steam-deck-game-tags/issues
- **Decky Discord:** https://deckbrew.xyz/discord
- **Email:** your-email@example.com (optional)

---

## Notes Section

Use this space for version-specific notes:

```
Version: v______
Date: ____-__-__

Special considerations:
-
-
-

Issues to watch:
-
-
-

Known issues not fixed:
-
-
-
```

---

## Automation Improvements

For future releases, consider:

- [ ] Automated testing in CI/CD
- [ ] Automated version bumping
- [ ] Automated changelog generation
- [ ] Automated Discord/Reddit posting
- [ ] Automated screenshot updates
- [ ] Release dashboard/metrics

---

## Final Check

Before clicking "Publish Release":

1. ✅ All items above are checked
2. ✅ Zip file verified and tested
3. ✅ Release notes are complete
4. ✅ No known critical bugs
5. ✅ Ready for public use

**If all checks pass: Proceed with release! 🚀**

**If any checks fail: Fix issues before releasing**