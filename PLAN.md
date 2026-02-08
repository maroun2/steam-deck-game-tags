# Steam Deck Game Progress Tracker - Development Plan

## Project Overview

**Plugin Name:** Game Progress Tracker (for Decky Loader)

**Core Feature:** Automatic and manual tagging system for Steam games with visual badges displayed in the library.

### Tag Types

1. **Completed** - All achievements unlocked from Steam
2. **In Progress** - Played for at least 1 hour
3. **Mastered** - Playtime exceeds completion time from HowLongToBeat database

**Key Capabilities:**
- Automatic tag assignment based on game statistics
- Manual override for all tags
- Visual badges displayed over game tiles in Steam library
- Persistent storage with SQLite
- Integration with HowLongToBeat for completion time data

---

## Technical Stack

### Frontend
- **TypeScript + React** - UI components
- **Decky Frontend Library** - `@decky/ui` and `@decky/api`
- **Route Patching** - Inject components into Steam UI

### Backend
- **Python 3** - Async backend operations
- **howlongtobeatpy** - Game completion time data
- **vdf** - Parse Steam configuration files
- **aiosqlite** - Async SQLite database operations
- **Steam Web API** - Achievement and playtime data (optional)

### Storage
- **SQLite** - Local database for tags, cache, and settings

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Steam Deck UI (QAM)                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Game Library (Route Patched)            │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │   Game A     │  │   Game B     │           │    │
│  │  │  [Completed] │  │ [In Progress]│           │    │
│  │  └──────────────┘  └──────────────┘           │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                         ▲                               │
│                         │ React Components              │
└─────────────────────────┼───────────────────────────────┘
                          │
                          │ serverAPI
                          │
┌─────────────────────────▼───────────────────────────────┐
│                  Python Backend (main.py)               │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Steam Data   │  │ HLTB Service │  │  Database    │ │
│  │  Service     │  │              │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │  Steam   │      │   HLTB   │      │ SQLite   │
    │   VDF    │      │   API    │      │   DB     │
    │  Files   │      │  (Web)   │      │          │
    └──────────┘      └──────────┘      └──────────┘
```

---

## Implementation Phases

### Phase 1: Project Setup & Infrastructure

**Duration:** 2-4 hours

#### 1.1 Initialize Project
- [ ] Clone Decky plugin template from GitHub
- [ ] Set up project directory structure
- [ ] Initialize git repository
- [ ] Configure .gitignore for Python, Node.js, and Steam Deck specific files

#### 1.2 Development Environment
- [ ] Install Node.js v16.14+ and pnpm v9
- [ ] Install Python dependencies:
  ```bash
  pip install howlongtobeatpy aiosqlite python-vdf
  ```
- [ ] Configure VSCode settings for Steam Deck deployment
  - Set up SSH connection to Steam Deck
  - Configure deployment tasks

#### 1.3 Project Configuration
- [ ] Create `plugin.json` with metadata
- [ ] Set up `package.json` with dependencies
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Set up Rollup build configuration
- [ ] Create basic `README.md`

#### 1.4 Database Schema Design
- [ ] Design SQLite schema (see Database Schema section below)
- [ ] Create migration/initialization script

---

### Phase 2: Backend Development (main.py)

**Duration:** 12-16 hours

#### 2.1 Database Management (backend/src/database.py)

**Tables:**

```sql
-- Game tags with manual override support
CREATE TABLE game_tags (
    appid TEXT PRIMARY KEY,
    tag TEXT NOT NULL,  -- 'completed', 'in_progress', 'mastered'
    is_manual BOOLEAN DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HowLongToBeat cache
CREATE TABLE hltb_cache (
    appid TEXT PRIMARY KEY,
    game_name TEXT NOT NULL,
    matched_name TEXT,  -- Actual HLTB match
    similarity_score REAL,
    main_story REAL,
    main_extra REAL,
    completionist REAL,
    hltb_url TEXT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game statistics from Steam
CREATE TABLE game_stats (
    appid TEXT PRIMARY KEY,
    game_name TEXT NOT NULL,
    playtime_minutes INTEGER DEFAULT 0,
    total_achievements INTEGER DEFAULT 0,
    unlocked_achievements INTEGER DEFAULT 0,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plugin settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

**Functions to Implement:**
```python
async def init_database() -> None
async def get_tag(appid: str) -> dict | None
async def set_tag(appid: str, tag: str, is_manual: bool) -> bool
async def remove_tag(appid: str) -> bool
async def get_all_tags() -> list[dict]
async def cache_hltb_data(appid: str, data: dict) -> bool
async def get_hltb_cache(appid: str) -> dict | None
async def update_game_stats(appid: str, stats: dict) -> bool
async def get_setting(key: str, default: any) -> any
async def set_setting(key: str, value: any) -> bool
```

#### 2.2 Steam Data Service (backend/src/steam_data.py)

**Key Functions:**

```python
async def get_steam_user_id() -> str
    """Get the current Steam user ID from localconfig.vdf"""

async def get_game_playtime(appid: str) -> int
    """Get playtime in minutes from localconfig.vdf"""
    # Parse ~/.steam/steam/userdata/{userid}/localconfig.vdf

async def get_game_achievements(appid: str) -> dict
    """Get achievement progress for a game"""
    # Returns: {total: int, unlocked: int, percentage: float}
    # Option 1: Parse local stats files
    # Option 2: Use Steam Web API (requires API key)

async def get_game_name(appid: str) -> str
    """Get game name from appmanifest files"""
    # Parse ~/.steam/steam/steamapps/appmanifest_{appid}.acf

async def get_all_games() -> list[dict]
    """Get all games in Steam library"""
    # Returns: [{appid, name, playtime}]

async def get_library_folders() -> list[str]
    """Get all Steam library folder paths"""
    # Parse ~/.steam/steam/steamapps/libraryfolders.vdf
```

**File Paths to Parse:**
- `~/.steam/steam/userdata/{userid}/localconfig.vdf` - Playtime data
- `~/.steam/steam/steamapps/appmanifest_{appid}.acf` - Game metadata
- `~/.steam/steam/steamapps/libraryfolders.vdf` - Library locations
- `~/.steam/steam/userdata/{userid}/{appid}/stats/achievements.vdf` - Achievements

#### 2.3 HowLongToBeat Service (backend/src/hltb_service.py)

**Key Functions:**

```python
async def search_game(game_name: str) -> dict | None
    """Search HLTB for game completion times"""
    # Use howlongtobeatpy library
    # Implement 2-hour cache
    # Return best match with similarity > 0.7

async def get_completion_time(appid: str, game_name: str) -> dict | None
    """Get cached or fetch completion time for game"""
    # Check database cache first
    # If miss or expired, call search_game()
    # Store in cache

async def bulk_fetch_games(game_list: list[dict], delay: float = 1.0) -> dict
    """Batch fetch multiple games with delays"""
    # Respectful rate limiting
    # Progress callback support
```

**Data Structure:**
```python
{
    "appid": "570",
    "game_name": "Dota 2",
    "matched_name": "Dota 2",
    "similarity": 0.95,
    "main_story": None,  # Multiplayer game
    "main_extra": None,
    "completionist": None,
    "all_styles": 80.5,  # Average playtime
    "hltb_url": "https://howlongtobeat.com/game/123"
}
```

#### 2.4 Tag Logic Engine (main.py)

**Core Tag Assignment Logic:**

```python
async def calculate_auto_tag(appid: str) -> str | None
    """Calculate automatic tag based on game stats"""

    # Get game statistics
    stats = await get_game_stats(appid)
    hltb = await get_hltb_cache(appid)

    # Priority 1: Completed (100% achievements)
    if stats.total_achievements > 0:
        if stats.unlocked_achievements == stats.total_achievements:
            return "completed"

    # Priority 2: Mastered (over-played)
    if hltb and hltb.main_extra:
        completion_threshold = hltb.main_extra * 1.5  # configurable
        if stats.playtime_minutes > completion_threshold * 60:
            return "mastered"

    # Priority 3: In Progress (played >= 1 hour)
    if stats.playtime_minutes >= 60:
        return "in_progress"

    return None  # No tag

async def sync_game_tags(appid: str, force: bool = False) -> dict
    """Sync tags for a single game"""

    # Get current tag
    current_tag = await db.get_tag(appid)

    # Skip if manual override
    if current_tag and current_tag.is_manual and not force:
        return current_tag

    # Fetch fresh data
    await sync_game_stats(appid)

    # Calculate new tag
    new_tag = await calculate_auto_tag(appid)

    # Update if changed
    if new_tag != current_tag.tag:
        await db.set_tag(appid, new_tag, is_manual=False)

    return await db.get_tag(appid)
```

#### 2.5 Plugin API Methods (main.py)

**Methods exposed to frontend via serverAPI:**

```python
class Plugin:
    async def _main(self):
        """Initialize plugin on load"""
        await init_database()
        # Start background sync task

    async def _unload(self):
        """Cleanup on plugin unload"""
        # Close database connections

    # Tag Management
    async def get_game_tag(self, appid: str) -> dict:
        """Get tag for a specific game"""

    async def set_manual_tag(self, appid: str, tag: str) -> bool:
        """Manually set/override tag"""

    async def remove_tag(self, appid: str) -> bool:
        """Remove tag from game"""

    async def reset_to_auto_tag(self, appid: str) -> dict:
        """Reset manual override to auto-calculated tag"""

    # Data Sync
    async def sync_single_game(self, appid: str) -> dict:
        """Sync data and tags for single game"""

    async def sync_library(self, progress_callback: callable = None) -> dict:
        """Bulk sync entire library"""
        # Returns: {success: int, failed: int, errors: list}

    async def refresh_hltb_cache(self) -> dict:
        """Clear and rebuild HLTB cache"""

    # Game Info
    async def get_game_details(self, appid: str) -> dict:
        """Get all details for a game"""
        # Returns: stats, tag, hltb_data, manual_override

    # Settings
    async def get_settings(self) -> dict:
        """Get all plugin settings"""

    async def update_settings(self, settings: dict) -> bool:
        """Update plugin settings"""
        # Settings: auto_tag_enabled, mastered_multiplier,
        #           in_progress_threshold, cache_ttl

    # Statistics
    async def get_tag_statistics(self) -> dict:
        """Get counts per tag type"""
        # Returns: {completed: 5, in_progress: 12, mastered: 3}
```

---

### Phase 3: Frontend Development (src/)

**Duration:** 10-14 hours

#### 3.1 Type Definitions (src/types.ts)

```typescript
export interface GameTag {
  appid: string;
  tag: 'completed' | 'in_progress' | 'mastered' | null;
  isManual: boolean;
  lastUpdated: string;
}

export interface GameDetails {
  appid: string;
  gameName: string;
  playtimeMinutes: number;
  totalAchievements: number;
  unlockedAchievements: number;
  hltbData?: HLTBData;
  tag?: GameTag;
}

export interface HLTBData {
  matchedName: string;
  similarity: number;
  mainStory?: number;
  mainExtra?: number;
  completionist?: number;
  hltbUrl: string;
}

export interface PluginSettings {
  autoTagEnabled: boolean;
  masteredMultiplier: number;
  inProgressThreshold: number;
  cacheTTL: number;
}

export interface ServerAPI {
  callPluginMethod(method: string, args: any): Promise<any>;
  routerHook: {
    addPatch(route: string, callback: Function): any;
    removePatch(patch: any): void;
  };
}
```

#### 3.2 React Hook for Tag Data (src/hooks/useGameTag.ts)

```typescript
import { useState, useEffect } from 'react';
import { ServerAPI } from 'decky-frontend-lib';
import { GameTag, GameDetails } from '../types';

export function useGameTag(serverAPI: ServerAPI, appid: string) {
  const [tag, setTag] = useState<GameTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTag();
  }, [appid]);

  const fetchTag = async () => {
    try {
      setLoading(true);
      const result = await serverAPI.callPluginMethod('get_game_tag', {
        appid: appid
      });
      setTag(result.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setManualTag = async (newTag: string) => {
    try {
      await serverAPI.callPluginMethod('set_manual_tag', {
        appid: appid,
        tag: newTag
      });
      await fetchTag();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeTag = async () => {
    try {
      await serverAPI.callPluginMethod('remove_tag', { appid: appid });
      await fetchTag();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetToAuto = async () => {
    try {
      await serverAPI.callPluginMethod('reset_to_auto_tag', { appid: appid });
      await fetchTag();
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    tag,
    loading,
    error,
    refetch: fetchTag,
    setManualTag,
    removeTag,
    resetToAuto
  };
}
```

#### 3.3 Game Tag Badge Component (src/components/GameTag.tsx)

```typescript
import { VFC } from 'react';
import { GameTag as GameTagType } from '../types';

interface GameTagProps {
  tag: GameTagType;
  onClick?: () => void;
}

const TAG_STYLES = {
  completed: {
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    label: 'Completed'
  },
  in_progress: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    label: 'In Progress'
  },
  mastered: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    label: 'Mastered'
  }
};

export const GameTag: VFC<GameTagProps> = ({ tag, onClick }) => {
  if (!tag || !tag.tag) return null;

  const style = TAG_STYLES[tag.tag];

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: style.background,
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 1000,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      {style.label}
      {tag.isManual && (
        <span style={{ fontSize: '12px', opacity: 0.8 }}>✎</span>
      )}
    </div>
  );
};
```

#### 3.4 Tag Manager Modal (src/components/TagManager.tsx)

```typescript
import { VFC, useState, useEffect } from 'react';
import { ConfirmModal, PanelSection, PanelSectionRow, ButtonItem } from 'decky-frontend-lib';
import { ServerAPI } from 'decky-frontend-lib';
import { GameDetails } from '../types';

interface TagManagerProps {
  serverAPI: ServerAPI;
  appid: string;
  onClose: () => void;
}

export const TagManager: VFC<TagManagerProps> = ({ serverAPI, appid, onClose }) => {
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [appid]);

  const fetchDetails = async () => {
    const result = await serverAPI.callPluginMethod('get_game_details', {
      appid: appid
    });
    setDetails(result.result);
    setLoading(false);
  };

  const setTag = async (tag: string) => {
    await serverAPI.callPluginMethod('set_manual_tag', {
      appid: appid,
      tag: tag
    });
    await fetchDetails();
  };

  const resetToAuto = async () => {
    await serverAPI.callPluginMethod('reset_to_auto_tag', { appid: appid });
    await fetchDetails();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ConfirmModal
      strTitle={`Manage Tags: ${details?.gameName}`}
      strDescription="Set manual tags or reset to automatic"
      onCancel={onClose}
      onOK={onClose}
    >
      <PanelSection title="Game Statistics">
        <PanelSectionRow>
          <div>Playtime: {Math.floor(details.playtimeMinutes / 60)}h {details.playtimeMinutes % 60}m</div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div>Achievements: {details.unlockedAchievements}/{details.totalAchievements}</div>
        </PanelSectionRow>
        {details.hltbData && (
          <PanelSectionRow>
            <div>HLTB Main+Extra: {details.hltbData.mainExtra}h</div>
          </PanelSectionRow>
        )}
      </PanelSection>

      <PanelSection title="Current Tag">
        <PanelSectionRow>
          <div>
            {details.tag?.tag || 'No tag'}
            {details.tag?.isManual && ' (Manual)'}
          </div>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Set Tag">
        <PanelSectionRow>
          <ButtonItem onClick={() => setTag('completed')}>
            Completed
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => setTag('in_progress')}>
            In Progress
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => setTag('mastered')}>
            Mastered
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={resetToAuto}>
            Reset to Automatic
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </ConfirmModal>
  );
};
```

#### 3.5 Settings Panel (src/components/Settings.tsx)

```typescript
import { VFC, useState, useEffect } from 'react';
import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ToggleField,
  SliderField
} from 'decky-frontend-lib';
import { ServerAPI } from 'decky-frontend-lib';
import { PluginSettings } from '../types';

interface SettingsProps {
  serverAPI: ServerAPI;
}

export const Settings: VFC<SettingsProps> = ({ serverAPI }) => {
  const [settings, setSettings] = useState<PluginSettings>({
    autoTagEnabled: true,
    masteredMultiplier: 1.5,
    inProgressThreshold: 60,
    cacheTTL: 7200
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await serverAPI.callPluginMethod('get_settings', {});
    setSettings(result.result);
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await serverAPI.callPluginMethod('update_settings', {
      settings: newSettings
    });
  };

  const syncLibrary = async () => {
    await serverAPI.callPluginMethod('sync_library', {});
    // Show notification
  };

  return (
    <div>
      <PanelSection title="Automatic Tagging">
        <PanelSectionRow>
          <ToggleField
            label="Enable Auto-Tagging"
            checked={settings.autoTagEnabled}
            onChange={(value) => updateSetting('autoTagEnabled', value)}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Tag Thresholds">
        <PanelSectionRow>
          <SliderField
            label={`Mastered Multiplier: ${settings.masteredMultiplier}x`}
            value={settings.masteredMultiplier}
            min={1.0}
            max={3.0}
            step={0.1}
            onChange={(value) => updateSetting('masteredMultiplier', value)}
            description="Playtime must be this many times the completion time"
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={`In Progress Threshold: ${settings.inProgressThreshold}min`}
            value={settings.inProgressThreshold}
            min={15}
            max={300}
            step={15}
            onChange={(value) => updateSetting('inProgressThreshold', value)}
            description="Minimum playtime to mark as In Progress"
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Data Management">
        <PanelSectionRow>
          <ButtonItem onClick={syncLibrary}>
            Sync Entire Library
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => serverAPI.callPluginMethod('refresh_hltb_cache', {})}>
            Refresh HLTB Cache
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
```

#### 3.6 Main Plugin Entry (src/index.tsx)

```typescript
import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib';
import { ReactElement, useState } from 'react';
import { GameTag } from './components/GameTag';
import { TagManager } from './components/TagManager';
import { Settings } from './components/Settings';
import { useGameTag } from './hooks/useGameTag';

export default definePlugin((serverAPI: ServerAPI) => {
  let gamePagePatch: any;

  // Extract appid from route path
  const extractAppId = (path: string): string | null => {
    const match = path.match(/\/library\/app\/(\d+)/);
    return match ? match[1] : null;
  };

  // Component for game page overlay
  const GamePageOverlay = ({ appid }: { appid: string }) => {
    const { tag, loading } = useGameTag(serverAPI, appid);
    const [showManager, setShowManager] = useState(false);

    if (loading || !tag) return null;

    return (
      <>
        <GameTag tag={tag} onClick={() => setShowManager(true)} />
        {showManager && (
          <TagManager
            serverAPI={serverAPI}
            appid={appid}
            onClose={() => setShowManager(false)}
          />
        )}
      </>
    );
  };

  // Patch the game library page
  gamePagePatch = serverAPI.routerHook.addPatch(
    '/library/app/:appId',
    (props: { path: string; children: ReactElement }) => {
      const appid = extractAppId(props.path);

      if (appid) {
        return (
          <>
            {props.children}
            <GamePageOverlay appid={appid} />
          </>
        );
      }

      return props.children;
    }
  );

  return {
    title: <div className={staticClasses.Title}>Game Progress Tracker</div>,
    content: <Settings serverAPI={serverAPI} />,
    icon: <div>📊</div>,
    onDismount() {
      serverAPI.routerHook.removePatch(gamePagePatch);
    }
  };
});
```

---

### Phase 4: Advanced Features & Optimization

**Duration:** 8-12 hours

#### 4.1 Background Sync System

- [ ] Implement background task to periodically sync library
- [ ] Rate limiting for HLTB requests (1 request per second)
- [ ] Progress notifications for long-running sync operations
- [ ] Error recovery and retry logic

#### 4.2 Statistics Dashboard

- [ ] Total games by tag category
- [ ] Completion rate percentage
- [ ] Total playtime by tag category
- [ ] "Backlog" games (no tag assigned)
- [ ] Visual charts/graphs

#### 4.3 Performance Optimizations

- [ ] Lazy loading tags (only fetch when needed)
- [ ] Batch database queries
- [ ] Debounce UI updates
- [ ] SQLite indexing for fast lookups
- [ ] Memory usage monitoring

#### 4.4 Enhanced UI Features

- [ ] Tag filtering in library
- [ ] Custom tag colors (user preference)
- [ ] Tag position customization
- [ ] Animations for tag appearance
- [ ] Toast notifications for sync completion

#### 4.5 Edge Case Handling

- [ ] Games with no achievements (use playtime only)
- [ ] Non-Steam games (manual tagging only)
- [ ] DLC vs base games (filter DLC)
- [ ] Games not in HLTB database (fallback behavior)
- [ ] Multiplayer-only games (special handling)

---

## Database Schema

**File:** `backend/src/database.py`

```sql
-- Game tags with manual override support
CREATE TABLE IF NOT EXISTS game_tags (
    appid TEXT PRIMARY KEY,
    tag TEXT NOT NULL CHECK(tag IN ('completed', 'in_progress', 'mastered')),
    is_manual BOOLEAN DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_tag ON game_tags(tag);
CREATE INDEX idx_tags_manual ON game_tags(is_manual);

-- HowLongToBeat cache (2-hour TTL)
CREATE TABLE IF NOT EXISTS hltb_cache (
    appid TEXT PRIMARY KEY,
    game_name TEXT NOT NULL,
    matched_name TEXT,
    similarity_score REAL,
    main_story REAL,
    main_extra REAL,
    completionist REAL,
    all_styles REAL,
    hltb_url TEXT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hltb_cached_at ON hltb_cache(cached_at);

-- Game statistics from Steam
CREATE TABLE IF NOT EXISTS game_stats (
    appid TEXT PRIMARY KEY,
    game_name TEXT NOT NULL,
    playtime_minutes INTEGER DEFAULT 0,
    total_achievements INTEGER DEFAULT 0,
    unlocked_achievements INTEGER DEFAULT 0,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plugin settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('auto_tag_enabled', 'true'),
    ('mastered_multiplier', '1.5'),
    ('in_progress_threshold', '60'),
    ('cache_ttl', '7200');
```

---

## Configuration Files

### plugin.json

```json
{
  "name": "Game Progress Tracker",
  "author": "Your Name",
  "flags": ["_root"],
  "publish": {
    "tags": ["library", "achievements", "statistics", "enhancement"],
    "description": "Automatic game tagging based on achievements, playtime, and completion time. Track your progress with visual badges in the Steam library.",
    "image": "https://your-image-url.com/preview.png"
  }
}
```

### package.json

```json
{
  "name": "game-progress-tracker",
  "version": "1.0.0",
  "description": "Game tagging plugin for Steam Deck",
  "scripts": {
    "build": "shx rm -rf dist && rollup -c",
    "watch": "rollup -c -w",
    "test": "jest"
  },
  "keywords": ["decky", "steam-deck", "gaming", "achievements"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@decky/ui": "^4.6.2",
    "@decky/api": "^1.1.2"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^21.0.0",
    "@rollup/plugin-node-resolve": "^13.0.6",
    "@rollup/plugin-replace": "^3.0.0",
    "@rollup/plugin-typescript": "^8.2.1",
    "@types/react": "^18.0.0",
    "rollup": "^2.52.7",
    "shx": "^0.3.3",
    "tslib": "^2.3.1",
    "typescript": "^4.3.5"
  },
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["react", "react-dom"]
    }
  }
}
```

---

## Technical Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **HLTB game name matching** | Use similarity score threshold (>0.7), cache results, allow manual linking |
| **Steam achievement API rate limits** | Cache aggressively (2+ hours), batch requests with delays |
| **Non-Steam games** | Allow manual time entry, fallback to playtime-only tagging |
| **Performance with large libraries (500+ games)** | Lazy loading, SQLite indexing, background sync, debounced updates |
| **UI injection without breaking Steam** | Use route patching, proper cleanup in onDismount, error boundaries |
| **Different game types (DLC, demos, betas)** | Filter by game type, skip DLC in HLTB search, configurable exclusions |
| **Games not in HLTB database** | Graceful degradation, show "No data" indicator, manual time option |
| **Multiplayer-only games** | Use "all_styles" average from HLTB, or playtime-based threshold |

---

## File Structure

```
steam-deck-game-tags/
├── README.md                  # Project overview
├── PLAN.md                    # This document
├── TEST_PLAN.md              # Comprehensive test strategy
├── LICENSE                    # MIT License
├── .gitignore                # Git ignore rules
│
├── backend/
│   └── src/
│       ├── __init__.py
│       ├── database.py       # SQLite database management
│       ├── steam_data.py     # Steam API/VDF parsing
│       └── hltb_service.py   # HowLongToBeat integration
│
├── src/
│   ├── index.tsx             # Main plugin entry point
│   ├── types.ts              # TypeScript type definitions
│   │
│   ├── components/
│   │   ├── GameTag.tsx       # Tag badge component
│   │   ├── TagManager.tsx    # Manual tag editor modal
│   │   └── Settings.tsx      # Settings panel
│   │
│   └── hooks/
│       └── useGameTag.ts     # React hook for tag data
│
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── mocks/                # Mock data for testing
│
├── assets/
│   └── icon.png              # Plugin icon
│
├── main.py                   # Python backend entry point
├── plugin.json               # Plugin metadata
├── package.json              # npm configuration
├── pnpm-lock.yaml           # Lock file (lockfileVersion: 9.0)
├── tsconfig.json            # TypeScript configuration
├── rollup.config.js         # Build configuration
└── requirements.txt         # Python dependencies
```

---

## Dependencies

### Python (requirements.txt)

```
howlongtobeatpy>=1.0.20
aiosqlite>=0.17.0
python-vdf>=3.4
```

### Node.js (package.json)

See Configuration Files section above.

---

## Development Workflow

### Initial Setup

```bash
# Clone template
git clone https://github.com/SteamDeckHomebrew/decky-plugin-template game-progress-tracker
cd game-progress-tracker

# Install dependencies
pnpm install
pip install -r requirements.txt

# Configure VSCode settings
cp .vscode/defsettings.json .vscode/settings.json
# Edit settings.json with Steam Deck IP and credentials
```

### Development Cycle

```bash
# 1. Make changes to src/ or backend/

# 2. Build
pnpm run build

# 3. Deploy to Steam Deck (via VSCode task)
# Task: "builddeploy"

# 4. Test on Steam Deck
# - Open CEF debugger: http://DECK_IP:8081
# - Check logs: tail -f /tmp/decky/plugin.log

# 5. Iterate
```

### Debugging

**Frontend:**
- Enable CEF Remote Debugging in Decky settings
- Access Chrome DevTools at `http://DECK_IP:8081`
- Use `SharedJSContext` for live JavaScript execution

**Backend:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logging.info("Debug message here")
```
Check logs: `/tmp/decky/plugin.log`

---

## Reference Plugins

Study these existing plugins for implementation patterns:

1. **TabMaster** - Library tab management and patching
   - Repository: `https://github.com/Tormak9970/TabMaster`

2. **ProtonDB Badges** - Badge overlay on game pages
   - Repository: `https://github.com/OMGDuke/protondb-decky`

3. **HLTB for Deck** - HowLongToBeat integration
   - Repository: `https://github.com/hulkrelax/hltb-for-deck`

4. **DeckAchievementsManager** - Achievement access
   - Repository: `https://github.com/ifantom/DeckAchievementsManager`

---

## Next Steps

After completing Phase 4, refer to **TEST_PLAN.md** for comprehensive testing strategy before distribution.

For questions or issues:
- Decky Discord: `https://deckbrew.xyz/discord`
- Decky Wiki: `https://wiki.deckbrew.xyz/`
