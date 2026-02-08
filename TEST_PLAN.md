# Test Plan - Game Progress Tracker Plugin

## Overview

This document outlines the comprehensive testing strategy for the Game Progress Tracker plugin for Decky Loader. Testing is divided into multiple categories to ensure reliability, performance, and user experience quality.

---

## Test Categories

1. **Unit Tests** - Individual component and function testing
2. **Integration Tests** - Multi-component interaction testing
3. **UI/Component Tests** - React component rendering and interaction
4. **Performance Tests** - Load, speed, and resource usage testing
5. **Edge Case Tests** - Unusual scenarios and error conditions
6. **User Acceptance Tests** - Manual testing on actual hardware

---

## 1. Unit Tests

### 1.1 Database Module (backend/src/database.py)

**Test Suite:** `tests/unit/test_database.py`

#### Test Cases:

```python
class TestDatabase:
    """Unit tests for database operations"""

    async def test_init_database():
        """Test database initialization creates all tables"""
        # Given: Fresh database
        # When: init_database() is called
        # Then: All tables exist with correct schema

    async def test_set_tag_new_game():
        """Test setting tag for game without existing tag"""
        # Given: Game with no tag
        # When: set_tag(appid, 'completed', False)
        # Then: Tag is created and retrievable

    async def test_set_tag_update_existing():
        """Test updating existing tag"""
        # Given: Game with 'in_progress' tag
        # When: set_tag(appid, 'completed', False)
        # Then: Tag is updated to 'completed'

    async def test_manual_override_flag():
        """Test manual override flag is preserved"""
        # Given: Game with auto tag
        # When: set_tag(appid, 'mastered', True)
        # Then: is_manual flag is True

    async def test_get_nonexistent_tag():
        """Test getting tag for game without tag"""
        # Given: Game not in database
        # When: get_tag(appid)
        # Then: Returns None

    async def test_remove_tag():
        """Test removing tag from game"""
        # Given: Game with tag
        # When: remove_tag(appid)
        # Then: Tag is deleted, get_tag returns None

    async def test_cache_hltb_data():
        """Test caching HLTB data"""
        # Given: HLTB search results
        # When: cache_hltb_data(appid, data)
        # Then: Data is stored and retrievable

    async def test_hltb_cache_expiration():
        """Test HLTB cache respects TTL"""
        # Given: Cached data older than TTL
        # When: get_hltb_cache(appid)
        # Then: Returns None (expired)

    async def test_update_game_stats():
        """Test updating game statistics"""
        # Given: Game statistics from Steam
        # When: update_game_stats(appid, stats)
        # Then: Stats are stored correctly

    async def test_settings_crud():
        """Test settings create/read/update"""
        # Given: Settings table
        # When: set_setting(key, value) and get_setting(key)
        # Then: Values are stored and retrieved correctly

    async def test_get_all_tags():
        """Test retrieving all tags"""
        # Given: Multiple games with tags
        # When: get_all_tags()
        # Then: All tags returned as list

    async def test_concurrent_writes():
        """Test database handles concurrent writes"""
        # Given: Multiple async write operations
        # When: Executed concurrently
        # Then: All complete successfully, no corruption
```

**Tools:** pytest, pytest-asyncio, aiosqlite

**Assertions:**
- Database schema matches expected structure
- CRUD operations work correctly
- Timestamps are set automatically
- Indexes exist for performance
- Concurrent operations don't corrupt data

---

### 1.2 Steam Data Service (backend/src/steam_data.py)

**Test Suite:** `tests/unit/test_steam_data.py`

#### Test Cases:

```python
class TestSteamDataService:
    """Unit tests for Steam data parsing"""

    async def test_get_steam_user_id():
        """Test extracting Steam user ID from localconfig.vdf"""
        # Given: Mock localconfig.vdf file
        # When: get_steam_user_id()
        # Then: Returns correct user ID

    async def test_get_game_playtime():
        """Test extracting playtime for specific game"""
        # Given: Mock VDF with playtime data
        # When: get_game_playtime('570')  # Dota 2
        # Then: Returns playtime in minutes

    async def test_get_game_playtime_never_played():
        """Test playtime for game never played"""
        # Given: Game not in playtime data
        # When: get_game_playtime(appid)
        # Then: Returns 0

    async def test_parse_appmanifest():
        """Test parsing appmanifest ACF file"""
        # Given: Mock appmanifest_570.acf
        # When: get_game_name('570')
        # Then: Returns 'Dota 2'

    async def test_get_game_achievements():
        """Test extracting achievement progress"""
        # Given: Mock achievement stats file
        # When: get_game_achievements(appid)
        # Then: Returns {total, unlocked, percentage}

    async def test_get_game_achievements_no_achievements():
        """Test game with no achievements"""
        # Given: Game without achievements
        # When: get_game_achievements(appid)
        # Then: Returns {total: 0, unlocked: 0, percentage: 0}

    async def test_get_all_games():
        """Test retrieving all games from library"""
        # Given: Mock library with 3 games
        # When: get_all_games()
        # Then: Returns list of 3 games with appid and name

    async def test_get_library_folders():
        """Test parsing library folders"""
        # Given: Mock libraryfolders.vdf
        # When: get_library_folders()
        # Then: Returns list of folder paths

    async def test_missing_vdf_file():
        """Test handling missing VDF file"""
        # Given: VDF file doesn't exist
        # When: Any parsing function called
        # Then: Raises appropriate exception or returns empty

    async def test_malformed_vdf():
        """Test handling corrupted VDF file"""
        # Given: Invalid VDF syntax
        # When: Parsing attempted
        # Then: Raises VDFError or returns empty
```

**Tools:** pytest, pytest-asyncio, python-vdf

**Mock Data:**
- Sample VDF files for various scenarios
- Different Steam library configurations
- Games with and without achievements

---

### 1.3 HowLongToBeat Service (backend/src/hltb_service.py)

**Test Suite:** `tests/unit/test_hltb_service.py`

#### Test Cases:

```python
class TestHLTBService:
    """Unit tests for HowLongToBeat integration"""

    async def test_search_game_exact_match():
        """Test searching for well-known game"""
        # Given: Game name "The Witcher 3"
        # When: search_game("The Witcher 3")
        # Then: Returns match with similarity > 0.9

    async def test_search_game_fuzzy_match():
        """Test fuzzy matching for similar names"""
        # Given: Slightly different name
        # When: search_game("Witcher 3 Wild Hunt")
        # Then: Returns correct match with similarity > 0.7

    async def test_search_game_not_found():
        """Test searching for non-existent game"""
        # Given: Fake game name
        # When: search_game("NonExistentGame12345")
        # Then: Returns None or empty results

    async def test_search_game_low_similarity():
        """Test filtering low similarity matches"""
        # Given: Generic search term
        # When: search_game("Game")
        # Then: Rejects matches with similarity < 0.7

    async def test_cache_hit():
        """Test returning cached data"""
        # Given: Previously cached game data
        # When: get_completion_time(appid, name)
        # Then: Returns cached data without API call

    async def test_cache_miss():
        """Test fetching fresh data on cache miss"""
        # Given: No cached data
        # When: get_completion_time(appid, name)
        # Then: Calls HLTB API and caches result

    async def test_cache_expiration():
        """Test cache respects TTL"""
        # Given: Cached data older than 2 hours
        # When: get_completion_time(appid, name)
        # Then: Fetches fresh data

    async def test_bulk_fetch_rate_limiting():
        """Test batch fetching respects delays"""
        # Given: List of 5 games
        # When: bulk_fetch_games(games, delay=0.5)
        # Then: Takes at least 2.5 seconds

    async def test_multiplayer_game():
        """Test handling multiplayer-only games"""
        # Given: "Counter-Strike 2"
        # When: search_game("Counter-Strike 2")
        # Then: Returns data with None for main_story

    async def test_hltb_api_error():
        """Test handling HLTB service errors"""
        # Given: HLTB API is unreachable
        # When: search_game(name)
        # Then: Returns error dict or raises exception
```

**Tools:** pytest, pytest-asyncio, howlongtobeatpy, unittest.mock

**Mocking:**
- Mock HLTB API responses to avoid real network calls
- Simulate network errors and timeouts
- Create deterministic test scenarios

---

### 1.4 Tag Logic Engine (main.py)

**Test Suite:** `tests/unit/test_tag_logic.py`

#### Test Cases:

```python
class TestTagLogic:
    """Unit tests for automatic tag calculation"""

    async def test_completed_tag_all_achievements():
        """Test 'completed' tag when all achievements unlocked"""
        # Given: Game with 50/50 achievements
        # When: calculate_auto_tag(appid)
        # Then: Returns 'completed'

    async def test_completed_tag_no_achievements():
        """Test no completed tag when game has 0 total achievements"""
        # Given: Game with 0 total achievements
        # When: calculate_auto_tag(appid)
        # Then: Does not return 'completed'

    async def test_mastered_tag_over_completion_time():
        """Test 'mastered' tag when playtime exceeds threshold"""
        # Given: Game with 60h playtime, HLTB main+extra = 30h
        # And: Multiplier = 1.5 (threshold = 45h)
        # When: calculate_auto_tag(appid)
        # Then: Returns 'mastered'

    async def test_mastered_tag_under_threshold():
        """Test no mastered tag when under threshold"""
        # Given: Game with 40h playtime, threshold = 45h
        # When: calculate_auto_tag(appid)
        # Then: Does not return 'mastered'

    async def test_in_progress_tag():
        """Test 'in_progress' tag for games played >= 1 hour"""
        # Given: Game with 75 minutes playtime
        # When: calculate_auto_tag(appid)
        # Then: Returns 'in_progress'

    async def test_no_tag_under_threshold():
        """Test no tag assigned for minimal playtime"""
        # Given: Game with 30 minutes playtime
        # When: calculate_auto_tag(appid)
        # Then: Returns None

    async def test_tag_priority_completed_over_mastered():
        """Test 'completed' takes priority over 'mastered'"""
        # Given: Game with 100% achievements AND high playtime
        # When: calculate_auto_tag(appid)
        # Then: Returns 'completed' (not 'mastered')

    async def test_tag_priority_mastered_over_in_progress():
        """Test 'mastered' takes priority over 'in_progress'"""
        # Given: Game exceeds mastered threshold
        # When: calculate_auto_tag(appid)
        # Then: Returns 'mastered' (not 'in_progress')

    async def test_no_hltb_data_fallback():
        """Test tag calculation without HLTB data"""
        # Given: Game not in HLTB database
        # When: calculate_auto_tag(appid)
        # Then: Uses achievements and playtime only

    async def test_configurable_thresholds():
        """Test custom threshold settings"""
        # Given: Custom multiplier = 2.0, min_playtime = 120
        # When: calculate_auto_tag(appid)
        # Then: Uses custom thresholds
```

**Tools:** pytest, pytest-asyncio

**Mock Data:**
- Various game statistics combinations
- Different HLTB data scenarios
- Custom settings configurations

---

## 2. Integration Tests

### 2.1 Full Tag Sync Pipeline

**Test Suite:** `tests/integration/test_tag_sync.py`

#### Test Cases:

```python
class TestTagSyncIntegration:
    """Integration tests for complete tag sync flow"""

    async def test_sync_single_game_complete_flow():
        """Test full sync for single game"""
        # Given: Game appid and fresh database
        # When: sync_game_tags(appid)
        # Then:
        #   - Steam data fetched
        #   - HLTB data fetched and cached
        #   - Tag calculated and stored
        #   - Returns complete game details

    async def test_sync_respects_manual_override():
        """Test sync skips manually tagged games"""
        # Given: Game with manual tag
        # When: sync_game_tags(appid, force=False)
        # Then: Tag is not recalculated

    async def test_force_sync_overrides_manual():
        """Test force sync recalculates manual tags"""
        # Given: Game with manual tag
        # When: sync_game_tags(appid, force=True)
        # Then: Tag is recalculated from stats

    async def test_bulk_library_sync():
        """Test syncing entire library"""
        # Given: Library with 50 games
        # When: sync_library()
        # Then:
        #   - All games processed
        #   - Progress reported
        #   - Errors logged but don't stop process

    async def test_partial_sync_failure():
        """Test handling failures in bulk sync"""
        # Given: Some games have invalid data
        # When: sync_library()
        # Then:
        #   - Valid games processed successfully
        #   - Errors reported
        #   - Returns success/failure counts

    async def test_cache_effectiveness():
        """Test HLTB cache reduces API calls"""
        # Given: Game synced once
        # When: sync_game_tags(appid) called again within 2 hours
        # Then: Uses cached HLTB data, no new API call
```

**Tools:** pytest, pytest-asyncio

**Assertions:**
- Complete data flow from Steam → HLTB → Database → Tag
- Error handling at each stage
- Cache behavior
- Manual override logic

---

### 2.2 Database + Steam Data Integration

**Test Suite:** `tests/integration/test_steam_integration.py`

#### Test Cases:

```python
class TestSteamIntegration:
    """Integration tests for Steam data + database"""

    async def test_fetch_and_store_game_stats():
        """Test fetching from Steam and storing in DB"""
        # Given: Real Steam library (or mock)
        # When: Fetch game stats and store
        # Then: Data correctly stored and retrievable

    async def test_update_existing_stats():
        """Test updating previously stored stats"""
        # Given: Game with old stats in DB
        # When: Fetch fresh stats from Steam
        # Then: Database updated with new values

    async def test_handle_missing_game():
        """Test handling game not in Steam library"""
        # Given: Invalid appid
        # When: Attempt to fetch stats
        # Then: Graceful error handling
```

---

## 3. UI/Component Tests

### 3.1 React Component Tests

**Test Suite:** `tests/unit/test_components.tsx`

#### Test Cases:

```typescript
describe('GameTag Component', () => {
  test('renders completed tag with correct style', () => {
    // Given: Tag with type 'completed'
    // When: Component rendered
    // Then: Shows green gradient and "Completed" text
  });

  test('renders manual override indicator', () => {
    // Given: Tag with isManual = true
    // When: Component rendered
    // Then: Shows edit icon (✎)
  });

  test('handles click event', () => {
    // Given: onClick callback provided
    // When: Tag clicked
    // Then: Callback invoked
  });

  test('does not render when tag is null', () => {
    // Given: tag = null
    // When: Component rendered
    // Then: Nothing rendered
  });
});

describe('TagManager Component', () => {
  test('loads game details on mount', async () => {
    // Given: Valid appid
    // When: Component mounts
    // Then: Calls get_game_details API
  });

  test('displays current tag and stats', () => {
    // Given: Game with tag and stats
    // When: Component rendered
    // Then: Shows playtime, achievements, HLTB data
  });

  test('updates tag on button click', async () => {
    // Given: Tag manager open
    // When: User clicks "Completed" button
    // Then: Calls set_manual_tag API
  });

  test('resets to auto tag', async () => {
    // Given: Game with manual tag
    // When: User clicks "Reset to Automatic"
    // Then: Calls reset_to_auto_tag API
  });
});

describe('Settings Component', () => {
  test('loads settings on mount', async () => {
    // Given: Component mounted
    // When: useEffect runs
    // Then: Calls get_settings API
  });

  test('updates setting on toggle', async () => {
    // Given: Settings loaded
    // When: User toggles "Enable Auto-Tagging"
    // Then: Calls update_settings API
  });

  test('validates slider constraints', () => {
    // Given: Slider for multiplier
    // When: User drags slider
    // Then: Value constrained between min/max
  });
});
```

**Tools:** Jest, React Testing Library, @testing-library/react-hooks

**Assertions:**
- Components render correctly
- User interactions trigger expected actions
- API calls made with correct parameters
- Loading and error states handled

---

### 3.2 Custom Hook Tests

**Test Suite:** `tests/unit/test_hooks.tsx`

#### Test Cases:

```typescript
describe('useGameTag Hook', () => {
  test('fetches tag on mount', async () => {
    // Given: Valid appid
    // When: Hook initialized
    // Then: Calls get_game_tag API
  });

  test('updates tag on setManualTag', async () => {
    // Given: Hook initialized
    // When: setManualTag('completed') called
    // Then: API called and tag refetched
  });

  test('handles loading state', () => {
    // Given: API call in progress
    // When: Hook rendered
    // Then: loading = true
  });

  test('handles error state', async () => {
    // Given: API call fails
    // When: Hook tries to fetch
    // Then: error is set with message
  });

  test('refetch functionality', async () => {
    // Given: Tag already loaded
    // When: refetch() called
    // Then: API called again, tag updated
  });
});
```

---

## 4. Performance Tests

### 4.1 Load Testing

**Test Suite:** `tests/performance/test_load.py`

#### Test Cases:

```python
class TestPerformance:
    """Performance and load testing"""

    async def test_large_library_sync_time():
        """Test sync performance with large library"""
        # Given: Library with 500 games
        # When: sync_library() executed
        # Then: Completes in under 10 minutes (with delays)

    async def test_database_query_performance():
        """Test database query speed"""
        # Given: Database with 1000 game tags
        # When: get_all_tags() called 100 times
        # Then: Average query time < 10ms

    async def test_concurrent_tag_fetches():
        """Test parallel tag fetches"""
        # Given: 20 simultaneous requests for tags
        # When: Executed concurrently
        # Then: All complete successfully without blocking

    async def test_memory_usage_large_library():
        """Test memory consumption"""
        # Given: Sync of 500 games
        # When: Monitor memory during sync
        # Then: Peak memory < 500MB

    async def test_hltb_cache_hit_rate():
        """Test cache effectiveness"""
        # Given: 100 games synced twice
        # When: Second sync executed
        # Then: 95%+ cache hit rate

    async def test_ui_render_performance():
        """Test UI rendering speed"""
        # Given: Game page with tag
        # When: Route navigation occurs
        # Then: Tag appears in < 100ms
```

**Tools:** pytest, memory_profiler, time

**Metrics:**
- Sync time per game
- Database query latency
- Memory consumption
- HLTB API call frequency
- UI render time

---

### 4.2 Stress Testing

**Test Suite:** `tests/performance/test_stress.py`

#### Test Cases:

```python
class TestStress:
    """Stress testing for edge conditions"""

    async def test_rapid_tag_updates():
        """Test rapid tag changes"""
        # Given: Single game
        # When: Tag updated 50 times in quick succession
        # Then: All updates succeed, final state correct

    async def test_database_under_load():
        """Test database with high concurrent writes"""
        # Given: 100 simultaneous write operations
        # When: All executed concurrently
        # Then: No deadlocks or corruption

    async def test_hltb_rate_limiting():
        """Test HLTB service under load"""
        # Given: 50 games to fetch
        # When: All requested without delays
        # Then: Rate limiting prevents abuse

    async def test_corrupted_cache_recovery():
        """Test recovery from corrupted cache"""
        # Given: Corrupted SQLite database
        # When: Plugin starts
        # Then: Detects corruption, rebuilds database
```

---

## 5. Edge Case Tests

### 5.1 Unusual Game Scenarios

**Test Suite:** `tests/edge_cases/test_game_types.py`

#### Test Cases:

```python
class TestGameEdgeCases:
    """Edge cases for unusual game types"""

    async def test_game_with_no_achievements():
        """Test game without achievement system"""
        # Given: Game with 0 total achievements
        # When: Tag calculated
        # Then: Uses only playtime-based tags

    async def test_non_steam_game():
        """Test non-Steam game (shortcut)"""
        # Given: Non-Steam game appid (> 2^31)
        # When: Sync attempted
        # Then: Skips or handles gracefully

    async def test_dlc_vs_base_game():
        """Test distinguishing DLC from base game"""
        # Given: DLC appid
        # When: HLTB search performed
        # Then: Filters out or handles correctly

    async def test_early_access_game():
        """Test early access game (incomplete)"""
        # Given: EA game with partial achievements
        # When: Tag calculated
        # Then: Handles incomplete achievement list

    async def test_multiplayer_only_game():
        """Test MP-only game with no story mode"""
        # Given: "Counter-Strike 2"
        # When: HLTB data fetched
        # Then: Uses average playtime, no main_story

    async def test_game_with_hundreds_of_achievements():
        """Test game with excessive achievements"""
        # Given: Game with 500+ achievements
        # When: Tag calculated
        # Then: Handles large numbers correctly

    async def test_game_name_with_special_characters():
        """Test games with special chars in name"""
        # Given: "Game™: Edition® - Part #1"
        # When: HLTB search performed
        # Then: Matching still works

    async def test_recently_released_game():
        """Test newly released game not in HLTB"""
        # Given: Game released yesterday
        # When: HLTB search performed
        # Then: Gracefully handles no data
```

---

### 5.2 Error Conditions

**Test Suite:** `tests/edge_cases/test_errors.py`

#### Test Cases:

```python
class TestErrorHandling:
    """Error condition testing"""

    async def test_missing_steam_files():
        """Test when Steam VDF files missing"""
        # Given: VDF files don't exist
        # When: Sync attempted
        # Then: Returns error, doesn't crash

    async def test_hltb_service_down():
        """Test when HLTB is unreachable"""
        # Given: Network error for HLTB
        # When: Sync attempted
        # Then: Uses cached data or skips HLTB

    async def test_database_locked():
        """Test database lock contention"""
        # Given: Database locked by another process
        # When: Write attempted
        # Then: Retries or returns error

    async def test_invalid_appid():
        """Test with invalid appid"""
        # Given: appid = "invalid"
        # When: Any operation attempted
        # Then: Validates and returns error

    async def test_corrupted_game_stats():
        """Test handling corrupted Steam data"""
        # Given: Malformed VDF file
        # When: Parsing attempted
        # Then: Catches error, logs, continues

    async def test_disk_full():
        """Test when disk space exhausted"""
        # Given: No disk space for database
        # When: Write attempted
        # Then: Catches error, notifies user

    async def test_network_timeout():
        """Test HLTB request timeout"""
        # Given: HLTB request takes > 30s
        # When: Timeout occurs
        # Then: Cancels request, returns error
```

---

## 6. User Acceptance Tests (Manual)

### 6.1 Installation & Setup

**Test Suite:** Manual testing on Steam Deck

#### Test Cases:

- [ ] **Install Plugin via Decky Store**
  - Open Decky Loader
  - Search for "Game Progress Tracker"
  - Install successfully
  - Plugin appears in QAM

- [ ] **First Launch**
  - Plugin initializes without errors
  - Database created successfully
  - Settings show default values

- [ ] **Initial Library Sync**
  - Trigger "Sync Entire Library"
  - Progress indicator appears
  - Sync completes for all games
  - No crashes or freezes

---

### 6.2 Tag Display & Interaction

**Test Suite:** Manual UI testing

#### Test Cases:

- [ ] **Tag Appearance in Library**
  - Open Steam library
  - Navigate to game with tag
  - Tag badge displays over game image
  - Tag positioned correctly (top-right)
  - Tag colors match specification

- [ ] **Tag Types Visual Test**
  - Verify "Completed" tag is green
  - Verify "In Progress" tag is blue
  - Verify "Mastered" tag is gold/purple
  - Manual override icon appears when applicable

- [ ] **Tag Click Interaction**
  - Click on tag badge
  - Tag Manager modal opens
  - Game details displayed correctly
  - Manual tag buttons functional

- [ ] **Manual Tag Override**
  - Open Tag Manager
  - Click "Completed" button
  - Tag updates immediately
  - Manual indicator (✎) appears
  - Changes persist after closing modal

- [ ] **Reset to Automatic**
  - Manually override a tag
  - Click "Reset to Automatic"
  - Tag recalculates based on stats
  - Manual indicator disappears

---

### 6.3 Settings Configuration

**Test Suite:** Manual settings testing

#### Test Cases:

- [ ] **Auto-Tagging Toggle**
  - Disable auto-tagging
  - Sync a game
  - Verify no tag assigned
  - Re-enable auto-tagging
  - Verify tag assigned on sync

- [ ] **Mastered Multiplier Adjustment**
  - Set multiplier to 2.0x
  - Sync game with high playtime
  - Verify "Mastered" threshold changed
  - Lower multiplier to 1.2x
  - Verify more games tagged "Mastered"

- [ ] **In Progress Threshold**
  - Set threshold to 120 minutes
  - Sync game with 90 minutes playtime
  - Verify no "In Progress" tag
  - Sync game with 150 minutes
  - Verify "In Progress" tag appears

---

### 6.4 Real-World Scenarios

**Test Suite:** End-to-end workflows

#### Test Cases:

- [ ] **Complete a Game Scenario**
  - Start with game at 90% achievements
  - Mark in plugin as "In Progress"
  - Complete remaining achievements in Steam
  - Trigger sync
  - Verify tag updates to "Completed"

- [ ] **Over-Play a Game Scenario**
  - Game with "Completed" tag
  - Play game for many more hours
  - Trigger sync
  - Verify tag remains "Completed" (priority)
  - Manually change to "Mastered"

- [ ] **New Game Installation**
  - Install new game from Steam
  - Play for 2 hours
  - Trigger sync
  - Verify "In Progress" tag appears
  - Verify HLTB data cached

- [ ] **Mixed Library Test**
  - Library with variety of games:
    - 100% completed games
    - Partially played games
    - Never played games
    - Non-Steam games
  - Trigger bulk sync
  - Verify appropriate tags for each category

---

### 6.5 Performance & Stability

**Test Suite:** Real hardware testing

#### Test Cases:

- [ ] **Large Library Performance**
  - Test with 200+ game library
  - Measure sync time (should complete)
  - UI remains responsive during sync
  - No crashes or freezes

- [ ] **Battery Impact**
  - Monitor battery drain during sync
  - Compare to baseline Steam Deck usage
  - Verify acceptable impact

- [ ] **Storage Usage**
  - Check database file size after 500 games
  - Verify < 50MB for database
  - Check log file size

- [ ] **Long-Term Stability**
  - Run plugin for 1 week
  - Perform multiple syncs
  - Verify no memory leaks
  - Verify no database corruption

---

### 6.6 Cross-Compatibility

**Test Suite:** Different configurations

#### Test Cases:

- [ ] **Multiple Steam Libraries**
  - Steam Deck with external SD card
  - Games on both internal and SD card
  - Verify all games detected and tagged

- [ ] **Different Steam Accounts**
  - Switch Steam account
  - Verify plugin adapts to new user
  - Verify separate tag databases

- [ ] **Steam Offline Mode**
  - Enable offline mode
  - Verify cached data still works
  - Verify tags display correctly

---

## 7. Regression Testing

### Test Matrix

After any code changes, run regression tests to ensure no existing functionality breaks.

**Critical Path Tests:**
1. Database initialization
2. Single game sync
3. Tag calculation logic
4. UI tag display
5. Manual tag override
6. Settings persistence

**Regression Test Frequency:**
- Before every commit: Unit tests
- Before every PR: Integration tests
- Before release: Full UAT suite

---

## 8. Test Data

### Mock Data Sets

**Location:** `tests/mocks/`

#### Files:

- `mock_localconfig.vdf` - Sample Steam playtime data
- `mock_appmanifest.acf` - Sample game metadata
- `mock_libraryfolders.vdf` - Sample library paths
- `mock_hltb_responses.json` - Sample HLTB API responses
- `mock_game_library.json` - Sample game list with various scenarios

---

## 9. Continuous Integration

### Automated Test Pipeline

**CI Configuration:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov

      - name: Run unit tests
        run: pytest tests/unit --cov=backend --cov-report=xml

      - name: Run integration tests
        run: pytest tests/integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 10. Test Coverage Goals

### Minimum Coverage Targets

- **Overall:** 80% code coverage
- **Critical paths:** 95% coverage
  - Tag calculation logic
  - Database operations
  - API methods
- **UI components:** 70% coverage
- **Error handling:** 90% coverage

### Coverage Reports

Generate coverage report:
```bash
pytest --cov=backend --cov=src --cov-report=html
```

---

## 11. Bug Tracking & Test Results

### Issue Template

```markdown
**Bug Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Test Case:**
[Which test case failed, if applicable]

**Environment:**
- Plugin Version:
- Steam Deck OS Version:
- Decky Loader Version:

**Logs:**
[Relevant log excerpts from /tmp/decky/plugin.log]
```

---

## 12. Test Execution Schedule

### Pre-Release Testing

**Timeline:** 1 week before release

- **Day 1-2:** Run all unit tests, fix failures
- **Day 3:** Run integration tests
- **Day 4:** Performance testing
- **Day 5-6:** User acceptance testing on Steam Deck
- **Day 7:** Bug fixes and retesting

### Post-Release Monitoring

- Monitor Decky Discord for user-reported issues
- Check logs from opt-in telemetry (if implemented)
- Respond to GitHub issues within 48 hours

---

## Summary

This comprehensive test plan ensures the Game Progress Tracker plugin is:

✅ **Reliable** - Handles edge cases and errors gracefully
✅ **Performant** - Works smoothly with large libraries
✅ **Accurate** - Correctly calculates and displays tags
✅ **User-Friendly** - Intuitive UI and interactions
✅ **Stable** - No crashes, memory leaks, or data corruption

**Total Estimated Testing Time:** 20-30 hours

---

## Next Steps

1. Set up test infrastructure (pytest, jest)
2. Create mock data files
3. Implement unit tests alongside development
4. Run integration tests after Phase 2-3 completion
5. Perform UAT on actual Steam Deck hardware
6. Address failures and iterate
7. Achieve coverage targets before release
