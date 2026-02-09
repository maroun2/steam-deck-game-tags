"""
Steam Data Service
Parses Steam VDF files to extract game information, playtime, and achievements
"""

import os
import vdf
from pathlib import Path
from typing import Optional, Dict, Any, List

# Use Decky's built-in logger
import decky
logger = decky.logger


class SteamDataService:
    def __init__(self):
        self.steam_path = self._find_steam_path()
        self.user_id = None

    def _find_steam_path(self) -> Optional[Path]:
        """Find Steam installation path"""
        possible_paths = [
            Path.home() / ".steam" / "steam",
            Path.home() / ".local" / "share" / "Steam",
            Path("/home/deck/.steam/steam"),  # Steam Deck default
        ]

        for path in possible_paths:
            if path.exists():
                logger.info(f"Found Steam path: {path}")
                return path

        logger.warning("Steam path not found")
        return None

    async def get_steam_user_id(self) -> Optional[str]:
        """Get the current Steam user ID from localconfig.vdf"""
        if self.user_id:
            return self.user_id

        if not self.steam_path:
            return None

        userdata_path = self.steam_path / "userdata"
        if not userdata_path.exists():
            logger.warning("Steam userdata directory not found")
            return None

        # Find the most recently used user directory
        user_dirs = [d for d in userdata_path.iterdir() if d.is_dir() and d.name.isdigit()]

        if not user_dirs:
            logger.warning("No Steam user directories found")
            return None

        # Use the first user directory (or most recently modified)
        user_dirs.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        self.user_id = user_dirs[0].name
        logger.info(f"Using Steam user ID: {self.user_id}")
        return self.user_id

    async def get_game_playtime(self, appid: str) -> int:
        """Get playtime in minutes from localconfig.vdf"""
        user_id = await self.get_steam_user_id()
        if not user_id or not self.steam_path:
            return 0

        localconfig_path = self.steam_path / "userdata" / user_id / "localconfig.vdf"

        if not localconfig_path.exists():
            logger.debug(f"localconfig.vdf not found for user {user_id}")
            return 0

        try:
            with open(localconfig_path, 'r', encoding='utf-8', errors='ignore') as f:
                data = vdf.load(f)

            # Navigate to playtime data
            # Structure: UserLocalConfigStore -> Software -> Valve -> Steam -> Apps -> {appid} -> PlayTime
            apps = (
                data.get("UserLocalConfigStore", {})
                .get("Software", {})
                .get("Valve", {})
                .get("Steam", {})
                .get("Apps", {})
            )

            if appid in apps and "LastPlayed" in apps[appid]:
                # PlayTime is typically in seconds in some fields, or minutes
                # Let's try to get the total playtime
                # The actual field might vary, commonly it's under stats
                playtime_seconds = apps[appid].get("TotalPlayTime", 0)
                if playtime_seconds:
                    return int(playtime_seconds) // 60

            logger.debug(f"No playtime found for appid {appid}")
            return 0

        except Exception as e:
            logger.error(f"Failed to parse localconfig.vdf: {e}")
            return 0

    async def get_game_name(self, appid: str) -> str:
        """Get game name from appmanifest files"""
        if not self.steam_path:
            return f"Unknown Game ({appid})"

        # Check common steam library locations
        library_folders = await self.get_library_folders()

        for library_path in library_folders:
            appmanifest_path = library_path / "steamapps" / f"appmanifest_{appid}.acf"

            if appmanifest_path.exists():
                try:
                    with open(appmanifest_path, 'r', encoding='utf-8', errors='ignore') as f:
                        data = vdf.load(f)

                    game_name = data.get("AppState", {}).get("name", f"Unknown Game ({appid})")
                    return game_name

                except Exception as e:
                    logger.error(f"Failed to parse appmanifest for {appid}: {e}")

        return f"Unknown Game ({appid})"

    async def get_game_achievements(self, appid: str) -> Dict[str, Any]:
        """Get achievement progress for a game"""
        user_id = await self.get_steam_user_id()
        if not user_id or not self.steam_path:
            return {"total": 0, "unlocked": 0, "percentage": 0.0}

        # Try to get achievements from local stats file
        stats_path = self.steam_path / "userdata" / user_id / appid / "stats"

        if not stats_path.exists():
            logger.debug(f"No stats directory for appid {appid}")
            return {"total": 0, "unlocked": 0, "percentage": 0.0}

        # Look for achievement files
        achievement_files = list(stats_path.glob("*.vdf"))

        if not achievement_files:
            logger.debug(f"No achievement files for appid {appid}")
            return {"total": 0, "unlocked": 0, "percentage": 0.0}

        try:
            # Parse the first achievement file found
            with open(achievement_files[0], 'r', encoding='utf-8', errors='ignore') as f:
                data = vdf.load(f)

            # Navigate to achievements
            # Structure varies, but typically: stats -> achievements
            achievements = data.get("stats", {}).get("achievements", {})

            if not achievements:
                return {"total": 0, "unlocked": 0, "percentage": 0.0}

            total = len(achievements)
            unlocked = sum(1 for ach in achievements.values() if ach.get("achieved", 0) == 1)
            percentage = (unlocked / total * 100) if total > 0 else 0.0

            return {
                "total": total,
                "unlocked": unlocked,
                "percentage": round(percentage, 2)
            }

        except Exception as e:
            logger.error(f"Failed to parse achievements for {appid}: {e}")
            return {"total": 0, "unlocked": 0, "percentage": 0.0}

    async def get_library_folders(self) -> List[Path]:
        """Get all Steam library folder paths"""
        if not self.steam_path:
            return []

        folders = [self.steam_path]

        libraryfolders_path = self.steam_path / "steamapps" / "libraryfolders.vdf"

        if not libraryfolders_path.exists():
            logger.debug("libraryfolders.vdf not found")
            return folders

        try:
            with open(libraryfolders_path, 'r', encoding='utf-8', errors='ignore') as f:
                data = vdf.load(f)

            # Parse library folders
            # Structure: libraryfolders -> {index} -> path
            library_data = data.get("libraryfolders", {})

            for key, value in library_data.items():
                if isinstance(value, dict) and "path" in value:
                    folder_path = Path(value["path"])
                    if folder_path.exists():
                        folders.append(folder_path)

        except Exception as e:
            logger.error(f"Failed to parse libraryfolders.vdf: {e}")

        return folders

    async def get_all_games(self) -> List[Dict[str, Any]]:
        """Get all games in Steam library"""
        games = []
        library_folders = await self.get_library_folders()

        for library_path in library_folders:
            steamapps_path = library_path / "steamapps"

            if not steamapps_path.exists():
                continue

            # Find all appmanifest files
            appmanifest_files = steamapps_path.glob("appmanifest_*.acf")

            for manifest_path in appmanifest_files:
                try:
                    # Extract appid from filename
                    appid = manifest_path.stem.replace("appmanifest_", "")

                    with open(manifest_path, 'r', encoding='utf-8', errors='ignore') as f:
                        data = vdf.load(f)

                    app_state = data.get("AppState", {})
                    game_name = app_state.get("name", f"Unknown ({appid})")

                    # Get playtime
                    playtime = await self.get_game_playtime(appid)

                    games.append({
                        "appid": appid,
                        "name": game_name,
                        "playtime_minutes": playtime
                    })

                except Exception as e:
                    logger.error(f"Failed to parse {manifest_path}: {e}")
                    continue

        logger.info(f"Found {len(games)} games in library")
        return games

    async def get_game_stats_full(self, appid: str) -> Dict[str, Any]:
        """Get complete game statistics (name, playtime, achievements)"""
        game_name = await self.get_game_name(appid)
        playtime = await self.get_game_playtime(appid)
        achievements = await self.get_game_achievements(appid)

        return {
            "appid": appid,
            "game_name": game_name,
            "playtime_minutes": playtime,
            "total_achievements": achievements["total"],
            "unlocked_achievements": achievements["unlocked"],
            "achievement_percentage": achievements["percentage"]
        }
