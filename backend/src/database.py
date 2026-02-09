"""
Database module for Game Progress Tracker
Handles SQLite operations for tags, cache, and settings
"""

import aiosqlite
import time
from pathlib import Path
from typing import Optional, Dict, Any, List

# Use Decky's built-in logger
import decky
logger = decky.logger


class Database:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.connection: Optional[aiosqlite.Connection] = None

    async def connect(self):
        """Establish database connection"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        logger.info(f"Connected to database: {self.db_path}")

    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()
            logger.info("Database connection closed")

    async def init_database(self):
        """Initialize database schema"""
        if not self.connection:
            await self.connect()

        await self.connection.execute("""
            CREATE TABLE IF NOT EXISTS game_tags (
                appid TEXT PRIMARY KEY,
                tag TEXT NOT NULL CHECK(tag IN ('completed', 'in_progress', 'mastered')),
                is_manual BOOLEAN DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await self.connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_tags_tag ON game_tags(tag)
        """)

        await self.connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_tags_manual ON game_tags(is_manual)
        """)

        await self.connection.execute("""
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
            )
        """)

        await self.connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_hltb_cached_at ON hltb_cache(cached_at)
        """)

        await self.connection.execute("""
            CREATE TABLE IF NOT EXISTS game_stats (
                appid TEXT PRIMARY KEY,
                game_name TEXT NOT NULL,
                playtime_minutes INTEGER DEFAULT 0,
                total_achievements INTEGER DEFAULT 0,
                unlocked_achievements INTEGER DEFAULT 0,
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await self.connection.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)

        # Insert default settings
        await self.connection.execute("""
            INSERT OR IGNORE INTO settings (key, value) VALUES
                ('auto_tag_enabled', 'true'),
                ('mastered_multiplier', '1.5'),
                ('in_progress_threshold', '60'),
                ('cache_ttl', '7200')
        """)

        await self.connection.commit()
        logger.info("Database schema initialized")

    # Tag operations
    async def get_tag(self, appid: str) -> Optional[Dict[str, Any]]:
        """Get tag for a specific game"""
        if not self.connection:
            return None

        cursor = await self.connection.execute(
            "SELECT * FROM game_tags WHERE appid = ?",
            (appid,)
        )
        row = await cursor.fetchone()

        if row:
            return {
                "appid": row["appid"],
                "tag": row["tag"],
                "is_manual": bool(row["is_manual"]),
                "last_updated": row["last_updated"]
            }
        return None

    async def set_tag(self, appid: str, tag: str, is_manual: bool = False) -> bool:
        """Set or update tag for a game"""
        if not self.connection:
            return False

        try:
            await self.connection.execute("""
                INSERT INTO game_tags (appid, tag, is_manual, last_updated)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(appid) DO UPDATE SET
                    tag = excluded.tag,
                    is_manual = excluded.is_manual,
                    last_updated = CURRENT_TIMESTAMP
            """, (appid, tag, int(is_manual)))

            await self.connection.commit()
            logger.debug(f"Set tag for {appid}: {tag} (manual={is_manual})")
            return True
        except Exception as e:
            logger.error(f"Failed to set tag for {appid}: {e}")
            return False

    async def remove_tag(self, appid: str) -> bool:
        """Remove tag from a game"""
        if not self.connection:
            return False

        try:
            await self.connection.execute(
                "DELETE FROM game_tags WHERE appid = ?",
                (appid,)
            )
            await self.connection.commit()
            logger.debug(f"Removed tag for {appid}")
            return True
        except Exception as e:
            logger.error(f"Failed to remove tag for {appid}: {e}")
            return False

    async def get_all_tags(self) -> List[Dict[str, Any]]:
        """Get all game tags"""
        if not self.connection:
            return []

        cursor = await self.connection.execute("SELECT * FROM game_tags")
        rows = await cursor.fetchall()

        return [
            {
                "appid": row["appid"],
                "tag": row["tag"],
                "is_manual": bool(row["is_manual"]),
                "last_updated": row["last_updated"]
            }
            for row in rows
        ]

    # HLTB cache operations
    async def cache_hltb_data(self, appid: str, data: Dict[str, Any]) -> bool:
        """Cache HowLongToBeat data"""
        if not self.connection:
            return False

        try:
            await self.connection.execute("""
                INSERT INTO hltb_cache (
                    appid, game_name, matched_name, similarity_score,
                    main_story, main_extra, completionist, all_styles,
                    hltb_url, cached_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(appid) DO UPDATE SET
                    game_name = excluded.game_name,
                    matched_name = excluded.matched_name,
                    similarity_score = excluded.similarity_score,
                    main_story = excluded.main_story,
                    main_extra = excluded.main_extra,
                    completionist = excluded.completionist,
                    all_styles = excluded.all_styles,
                    hltb_url = excluded.hltb_url,
                    cached_at = CURRENT_TIMESTAMP
            """, (
                appid,
                data.get("game_name"),
                data.get("matched_name"),
                data.get("similarity"),
                data.get("main_story"),
                data.get("main_extra"),
                data.get("completionist"),
                data.get("all_styles"),
                data.get("hltb_url")
            ))

            await self.connection.commit()
            logger.debug(f"Cached HLTB data for {appid}")
            return True
        except Exception as e:
            logger.error(f"Failed to cache HLTB data for {appid}: {e}")
            return False

    async def get_hltb_cache(self, appid: str, ttl: int = 7200) -> Optional[Dict[str, Any]]:
        """Get cached HLTB data if not expired"""
        if not self.connection:
            return None

        cursor = await self.connection.execute(
            "SELECT * FROM hltb_cache WHERE appid = ?",
            (appid,)
        )
        row = await cursor.fetchone()

        if not row:
            return None

        # Check if cache is expired
        cached_timestamp = row["cached_at"]
        # cached_at is stored as CURRENT_TIMESTAMP (Unix timestamp or ISO string)
        # For simplicity, we'll check against current time
        current_time = time.time()

        # Parse cached_at - it might be Unix timestamp or ISO string
        try:
            cached_time = float(cached_timestamp)
        except (ValueError, TypeError):
            # If it's not a number, assume it's recent enough
            logger.warning(f"Could not parse cached_at timestamp: {cached_timestamp}")
            cached_time = current_time

        if current_time - cached_time > ttl:
            logger.debug(f"HLTB cache expired for {appid}")
            return None

        return {
            "appid": row["appid"],
            "game_name": row["game_name"],
            "matched_name": row["matched_name"],
            "similarity": row["similarity_score"],
            "main_story": row["main_story"],
            "main_extra": row["main_extra"],
            "completionist": row["completionist"],
            "all_styles": row["all_styles"],
            "hltb_url": row["hltb_url"]
        }

    # Game stats operations
    async def update_game_stats(self, appid: str, stats: Dict[str, Any]) -> bool:
        """Update game statistics"""
        if not self.connection:
            return False

        try:
            await self.connection.execute("""
                INSERT INTO game_stats (
                    appid, game_name, playtime_minutes,
                    total_achievements, unlocked_achievements, last_sync
                )
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(appid) DO UPDATE SET
                    game_name = excluded.game_name,
                    playtime_minutes = excluded.playtime_minutes,
                    total_achievements = excluded.total_achievements,
                    unlocked_achievements = excluded.unlocked_achievements,
                    last_sync = CURRENT_TIMESTAMP
            """, (
                appid,
                stats.get("game_name", ""),
                stats.get("playtime_minutes", 0),
                stats.get("total_achievements", 0),
                stats.get("unlocked_achievements", 0)
            ))

            await self.connection.commit()
            logger.debug(f"Updated stats for {appid}")
            return True
        except Exception as e:
            logger.error(f"Failed to update stats for {appid}: {e}")
            return False

    async def get_game_stats(self, appid: str) -> Optional[Dict[str, Any]]:
        """Get game statistics"""
        if not self.connection:
            return None

        cursor = await self.connection.execute(
            "SELECT * FROM game_stats WHERE appid = ?",
            (appid,)
        )
        row = await cursor.fetchone()

        if row:
            return {
                "appid": row["appid"],
                "game_name": row["game_name"],
                "playtime_minutes": row["playtime_minutes"],
                "total_achievements": row["total_achievements"],
                "unlocked_achievements": row["unlocked_achievements"],
                "last_sync": row["last_sync"]
            }
        return None

    # Settings operations
    async def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting value"""
        if not self.connection:
            return default

        cursor = await self.connection.execute(
            "SELECT value FROM settings WHERE key = ?",
            (key,)
        )
        row = await cursor.fetchone()

        if row:
            value = row["value"]
            # Try to convert to appropriate type
            if value.lower() in ('true', 'false'):
                return value.lower() == 'true'
            try:
                return float(value)
            except ValueError:
                return value
        return default

    async def set_setting(self, key: str, value: Any) -> bool:
        """Set a setting value"""
        if not self.connection:
            return False

        try:
            # Convert value to string
            str_value = str(value).lower() if isinstance(value, bool) else str(value)

            await self.connection.execute("""
                INSERT INTO settings (key, value)
                VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """, (key, str_value))

            await self.connection.commit()
            logger.debug(f"Set setting {key} = {value}")
            return True
        except Exception as e:
            logger.error(f"Failed to set setting {key}: {e}")
            return False

    async def get_all_settings(self) -> Dict[str, Any]:
        """Get all settings"""
        if not self.connection:
            return {}

        cursor = await self.connection.execute("SELECT key, value FROM settings")
        rows = await cursor.fetchall()

        settings = {}
        for row in rows:
            key = row["key"]
            value = row["value"]

            # Convert to appropriate type
            if value.lower() in ('true', 'false'):
                settings[key] = value.lower() == 'true'
            else:
                try:
                    settings[key] = float(value)
                except ValueError:
                    settings[key] = value

        return settings
